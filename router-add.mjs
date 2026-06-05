// officical
import express from 'express';

// local js
import logger from './logger.mjs';

// existing path
// '/': get
// '/transaction': get, post
// '/currency': get, post
export default function createRouter(db, __dirname) {
    const router = express.Router();

    // --------------------------------------------------

    router.get('/', logger, async (req, res) => {
        return res.send("home");
    }); // end get(/)

    // --------------------------------------------------
    // transaction related
    
    router.get('/transaction', logger, async (req, res) => {
        return res.render('basic-transaction', { title: 'Add Transaction' });
    }); // end get(/transaction)

    router.post('/transaction', logger, async (req, res) => {
        const data = req.body;
        console.log("info: Request Body: " + JSON.stringify(req.body, null, 2));
        const target_description = req.body.description;
        const target_date = req.body.date;
        const target_metadata = req.body.metadata;
        const target_is_deleted = req.body.is_deleted;
        const target_account_id_from = req.body.from_account_id;
        const target_account_id_to = req.body.to_account_id;
        const target_currency_id = req.body.currency_id || "HKD"; // default HKD
        const target_is_foregin = req.body.is_foregin || 0; // default 0
        const target_foreign_amount = req.body.foreign_amount || "";
        const target_exchange_rate = req.body.exchange_rate || "";
        
        // checking stage
        
        // 1. if target_account_id_from or target_account_id_to not exist in Account table, then return error
        // a check both at the same time
        const stmt_check_account = db.prepare('SELECT COUNT(DISTINCT id) AS count FROM Accounts WHERE id IN(?, ?)');
        // const stmt_check_account = db.prepare('SELECT COUNT(DISTINCT id) AS both_exist FROM Accounts WHERE id IN(?, ?)');

        const result_check_account = stmt_check_account.get(target_account_id_from, target_account_id_to);
        if (result_check_account.count != 2) {
            return res.status(422).json({
                status: "failed",
                message: "Invalid account IDs provided"
            });
        }
        // // b check one by one
        // const stmt_check_account = db.prepare('SELECT COUNT(*) AS count FROM Account WHERE id = ?');
        // const result_check_account_from = stmt_check_account.get(target_account_id_from);
        // const result_check_account_to = stmt_check_account.get(target_account_id_to);
        // if ( ! result_check_account_from && ! result_check_account_to) {
        //     return res.status(422).json({
        //         status: "failed",
        //         message: "Invalid account IDs provided"
        //     });
        // }

        // 2. if amount is invalid (not a number or negative), then return error
        const target_amount = req.body.amount;
        if (isNaN(target_amount) || target_amount < 0) {
            return res.status(422).json({
                status: "failed",
                message: "Invalid amount provided"
            });
        }

        // 3. if date is invalid
        const check_target_date = new Date(target_date);
        if (isNaN(check_target_date.getTime())) {
            return res.status(422).json({
                status: "failed",
                message: "Invalid date provided"
            });
        }
        
        // insert stage
        const stmt1 = db.prepare(`INSERT INTO TransactionsJournal (from_account_id, to_account_id, description, created_at, metadata, is_deleted) 
                                    VALUES ( @from_account_id, @to_account_id, @description, @created_at, @metadata, @is_deleted)`);
        const stmt2 = db.prepare(`INSERT INTO TransactionsLedger 
            (transactions_id , date_of_transaction, account_id, amount, is_credit, currency, is_foregin, foreign_amount, exchange_rate) 
            VALUES 
            (@transactions_id , @date_of_transaction, @account_id, @amount, @is_credit, @currency, @is_foregin, @foreign_amount, @exchange_rate)`);

        // ready function for open transaction in TransactionJournal and TransactionLedger
        const insertTransaction = db.transaction( (transactionData, ledgerData) => {
            // 1. insert into transaction journal
            let info1 = stmt1.run({
                from_account_id: transactionData.from_account_id,
                to_account_id: transactionData.to_account_id,
                description: transactionData.description,
                created_at: transactionData.created_at,
                metadata: transactionData.metadata,
                is_deleted: 0
            }); 

            if ( ! info1 || info1.changes != 1) {
                throw new Error(`Failed to insert transaction journal record for this item description: ${transactionData.description}`);
            }
            
            console.log(`info1: ${JSON.stringify(info1)}`)
            const transactions_id = info1.lastInsertRowid;
            
            if ( ! transactions_id || transactions_id <= 0 ) {
                throw new Error(`Failed to retrieve transaction_id after inserting transaction journal record for this item description: ${transactionData.description}`);
            }

            // insert into transaction ledger
            let info2 = stmt2.run({
                transactions_id: transactions_id,
                date_of_transaction: ledgerData.date_of_transaction,
                account_id: ledgerData.from_account_id,
                amount: ledgerData.amount,
                is_credit: 1,
                currency: ledgerData.currency,
                is_foregin: ledgerData.is_foregin,
                foreign_amount: ledgerData.foreign_amount,
                exchange_rate: ledgerData.exchange_rate
            }); 
            if ( ! info2 || info2.changes != 1) {
                throw new Error(`Failed to insert transaction Ledger record with these 2 account description: from ${ledgerData.account_id}  to ${ledgerData.account_id} with item description: ${ledgerData.description}`);
            }

            let info3 = stmt2.run({
                transactions_id: transactions_id,
                date_of_transaction: ledgerData.date_of_transaction,
                account_id: ledgerData.to_account_id,
                amount: ledgerData.amount,
                is_credit: 0,
                currency: ledgerData.currency,
                is_foregin: ledgerData.is_foregin,
                foreign_amount: ledgerData.foreign_amount,
                exchange_rate: ledgerData.exchange_rate
            });

            // post transaction checking
            // -> is the amount is 0 at the end?

            if ( ! info3 && ! info3.changes == 1) {
                throw new Error(`Failed to insert transaction Ledger record with these 2 account description: from ${ledgerData.account_id}  to ${ledgerData.account_id} with item description: ${ledgerData.description}`);
            }

            return {info1 , info2, info3};
        }); // end insertTransaction
            
        // insert action
        let info = null;
        try {
            let info = insertTransaction({
                description: target_description, 
                from_account_id: target_account_id_from,
                to_account_id: target_account_id_to,
                created_at: target_date, 
                metadata: target_metadata, 
                is_deleted: target_is_deleted
            }, {
                date_of_transaction: target_date,
                from_account_id: target_account_id_from,
                to_account_id: target_account_id_to,
                amount: target_amount,
                currency: target_currency_id,
                is_foregin: target_is_foregin,
                foreign_amount: target_foreign_amount,
                exchange_rate: target_exchange_rate
            });

        }
        catch (SqliteError) {
            return res.status(422).json({ 
                status: "failed", 
                message: `insertion failed`, 
                details: `SQLite Error: ${SqliteError.message}`,
                sqlaction: `ROLLBACK`, 
            });
        }

        // MYSQL / MARIADB
        // const check_stmt_result = db.prepare(`SELECT sum(IF is_credit, amount, 0) AS total_debit, 
        //                             sum(IF NOT(is_credit), amount, 0) AS total_credit 
        //                             FROM transactionsJournal`).run();
        // sqlite
        const check_stmt_result = db.prepare(`SELECT sum(CASE WHEN is_credit THEN amount ELSE 0 END) AS total_debit, 
                                    sum(CASE WHEN NOT is_credit THEN amount ELSE 0 END) AS total_credit 
                                    FROM transactionsJournal`).get();
        if ( check_stmt_result.total_debit - check_stmt_result.total_credit != 0 ) {
            return res.status(500).json({ 
                status: "failed", 
                message: `transaction record not accept`, 
                detail: `internal error` 
            });
        }

        // if ( ! info || info.changes != 1 ) {
        //     return res.status(422).json({ 
        //         status: "failed", 
        //         message: `transaction record not accept`, 
        //     });
        // }
        
        if (info && info.info1 && info.info1.lastInsertRowid) {
            console.log(`info: ${JSON.stringify(info)}`)
            // console.log(`Transaction inserted successfully with transaction_id: ${info[0].lastInsertRowid}`);
        }
        // const transaction_id = info[0].lastInsertRowid;
        return res.redirect('/add/transaction')

    }); // end post(/transaction)


    router.get('/v1/transaction', logger, async (req, res) => {
        return res.render('transaction', { title: 'Add Transaction' });
    }); // end get(/v1/transaction)
    
    router.post('/v1/transaction', logger, async (req, res) => {
        const data = req.body;
        console.log("info: Request Body: " + JSON.stringify(req.body, null, 2));
    
        const target_description = req.body.description;
        const target_created_at = req.body.created_at;
        const target_metadata = req.body.metadata;
        const target_is_deleted = req.body.is_deleted;
    
        // --- INSERT INTO transactionJournal (id, description) VALUE (@id, @description) ---
        const stmt = db.prepare('INSERT INTO transactionJournal (id, description, created_at, metadata, is_deleted) VALUES (@description, @created_at, @metadata, @is_deleted)');
        let info = null;
        try {
            info = stmt.run({
                description: target_description, 
                created_at: target_created_at, 
                metadata: target_metadata, 
                is_deleted: target_is_deleted
            });
        }
        catch (SqliteError) {
            return res.status(422).json({ 
                status: "failed", 
                message: `data received but invalid currency!  currency: ${target_id}  description: ${target_description}`, 
                details: `SQLite Error: ${SqliteError.message}`
            });
        }
    
        if ( info && info.changes != 1 ) {
            return res.status(422).json({ 
                status: "failed", 
                message: `data received but invalid currency!  currency: ${target_id}  description: ${target_description}` 
            });
        }
        
        return res.status(200).json({ 
            status: "success", 
            message: `data well received!  new currency: ${target_id}  description: ${target_description}` 
        });
    }); // end post(/v1/transaction)
    
    router.get('/demo/transaction', logger, async (req, res) => {
        return res.sendFile(path.join(__dirname, 'public', 'input-form.html'));
    }); // end get(/demo/transaction)
    
    router.post('/demo/transaction', logger, async (req, res) => {
        const data = req.body;
        console.log(`Received data: \n${data}`);
        console.log("Request Body: " + JSON.stringify(req.body, null, 2));
        
        return res.status(200).json({ 
            status: "success", 
            message: `data well received!` 
        });
    }); // end post(/demo/transaction)
    
    // --------------------------------------------------

    router.get('/currency', logger, async (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'new-currency.html'));
    }); // end get(/currency)
    
    router.post('/currency', logger, async (req, res) => {
        const data = req.body;
        const target_id = req.body.id;
        const target_description = req.body.description;
    
        console.log("Request Body: " + JSON.stringify(req.body, null, 2));
        console.log(`parsed id: ${target_id}, parsed description: ${target_description}`);
    
        // --- INSERT INTO Currency (id, description) VALUE (@id, @description) ---
        const stmt = db.prepare('INSERT INTO Currency (id, description) VALUES (@id, @description)');
        let info = null;
        try {
            info = stmt.run({id: target_id, description: target_description});
        }
        catch (SqliteError) {
            return res.status(422).json({ 
                status: "failed", 
                message: `data received but invalid currency!  currency: ${target_id}  description: ${target_description}`, 
                details: `SQLite Error: ${SqliteError.message}`
            });
        }
    
        if ( info && info.changes != 1 ) {
            return res.status(422).json({ 
                status: "failed", 
                message: `data received but invalid currency!  currency: ${target_id}  description: ${target_description}` 
            });
        }
        
        // Send a JSON response back to the frontend
        return res.status(200).json({ 
            status: "success", 
            message: `data well received!  new currency: ${target_id}  description: ${target_description}` 
        });
    }); // end post(/currency)
    
    return router;
}; // end createRouter()

// external
import express from 'express';

// existing path
// '/': get
// '/transaction': get, post
// '/currency': get, post

export default function createRouter(db, logger, __dirname) {
    const router = express.Router();

    // --------------------------------------------------

    router.get('/', logger, async (req, res) => {
        const targetTable = req.query.type ?? 0;
        if ( !(req.query && targetTable) ) {
            return res.send("home");
        }
        switch (targetTable) {
            case "transaction":
                return res.redirect("/add/transaction");
                break;
            case "account":
                return res.redirect("/add/account");
                break;
            case "category":
                return res.redirect("/add/category");
                break;
            case "currency":
                return res.redirect("/add/currency");
                break;
        }
    }); // end get(/)

    // --------------------------------------------------
    // transaction related
    
    router.get('/transaction', logger, async (req, res) => {
        return res.render('form/form-transaction', { title: 'Add Transaction' });
    }); // end get(/transaction)

    // ready function for open transaction in TransactionJournal and TransactionLedger
    const insertTransaction = db.transaction( (stmt1, stmt2, transactionData, ledgerData) => {
        // 1. insert into transaction journal
        let info1 = stmt1.run({
            description: transactionData.description,
            created_at: transactionData.created_at,
            metadata: transactionData.metadata,
            is_deleted: 0
        }); 

        if ( ! info1 || info1.changes != 1) {
            throw new Error(`Failed to insert transaction journal record for this item description: ${transactionData.description}`);
        }
        
        console.log(`info1: ${JSON.stringify(info1)}`)
        const transaction_id = info1.lastInsertRowid;
        
        if ( ! transaction_id || transaction_id <= 0 ) {
            throw new Error(`Failed to retrieve transaction_id after inserting transaction journal record for this item description: ${transactionData.description}`);
        }

        // insert into transaction ledger
        let info2 = stmt2.run({
            transaction_id: transaction_id,
            date_of_transaction: ledgerData.date_of_transaction,
            account_id: ledgerData.from_account_id,
            amount: ledgerData.amount,
            is_credit: 1,
            currency: ledgerData.currency,
            is_foreign: ledgerData.is_foreign,
            foreign_amount: ledgerData.foreign_amount,
            exchange_rate: ledgerData.exchange_rate
        }); 
        if ( ! info2 || info2.changes != 1) {
            throw new Error(`Failed to insert transaction Ledger record with these 2 account description: from ${ledgerData.account_id}  to ${ledgerData.account_id} with item description: ${ledgerData.description}`);
        }

        let info3 = stmt2.run({
            transaction_id: transaction_id,
            date_of_transaction: ledgerData.date_of_transaction,
            account_id: ledgerData.to_account_id,
            amount: ledgerData.amount,
            is_credit: 0,
            currency: ledgerData.currency,
            is_foreign: ledgerData.is_foreign,
            foreign_amount: ledgerData.foreign_amount,
            exchange_rate: ledgerData.exchange_rate
        });

        // post transaction checking
        // -> is the amount is 0 at the end?

        if ( ! info3 && ! info3.changes == 1) {
            throw new Error(`Failed to insert transaction Ledger record with these 2 account description: from ${ledgerData.account_id}  to ${ledgerData.account_id} with item description: ${ledgerData.description}`);
        }

        // check sum
        // MYSQL / MARIADB
        // const check_stmt_result = db.prepare(`SELECT sum(IF is_credit, amount, 0) AS total_debit, 
        //                             sum(IF NOT(is_credit), amount, 0) AS total_credit 
        //                             FROM transactionsJournal`).run();
        // sqlite
        const check_stmt_result = db.prepare(`SELECT sum(CASE WHEN is_credit THEN 0 ELSE amount END) AS total_debit, 
                                    sum(CASE WHEN is_credit THEN amount ELSE 0 END) AS total_credit 
                                    FROM transactionsLedger`).get();
        console.log(JSON.stringify(check_stmt_result, null, 2));
        if ( check_stmt_result.total_debit - check_stmt_result.total_credit != 0 ) {
            // return res.status(500).json({ 
            //     status: "failed", 
            //     message: `transaction record not accept`, 
            //     detail: `internal error` 
            // });
            throw new Error(`Error: Failed to insert transaction Ledger record with these 2 account description: from ${target_account_id_from}  to ${target_account_id_to} with item description: ${target_description}. Check Sum.`);
        }

        return [info1 , info2, info3];
    }); // end insertTransaction

    router.post('/transaction', logger, async (req, res) => {
        const data = req.body;
        console.log("info: Request Body: " + JSON.stringify(req.body, null, 2));
        const target_description = req.body.description ?? null;
        const target_date = req.body.date;
        const target_account_id_from = req.body.account_id_from;
        const target_account_id_to = req.body.account_id_to;
        const target_currency_id = req.body.currency_id ?? "HKD"; // default HKD
        const target_is_deleted = 0;
        let req_metadata = req.body.metadata ?? {};
        
        const rm_metadata = (obj) => {
            if (typeof obj !== 'object' || obj === null) return obj;
                let newObj = {};
                Object.keys(obj).forEach((key) => {
                    console.log(`im here for the key ${key} with ${obj[key]}`);
                    const value = obj[key];
                    
                    // Check if the value is an empty object
                    const isEmptyObject = value && typeof value === 'object' && Object.keys(value).length === 0;
                    
                    // Keep the value if it is not null, not undefined, and not an empty object
                    if ( value !== undefined && value !== null && !isEmptyObject && value !== "" ) {
                        console.log(`im here for the key ${key} with ${obj[key]}`);
                        if ( value === "1" ) {
                            newObj[key] = true;
                        }
                        else if ( value === "0" ) {
                            newObj[key] = false;
                        }
                        else {
                            newObj[key] = value;
                        }
                    }
                });
            return newObj;
        };
        
        const target_metadata = JSON.stringify(rm_metadata(req_metadata));
        console.log(target_metadata);
        const target_is_foreign = target_metadata.is_foreign ?? 0; // req.body.is_foreign || 0; // default 0
        const target_foreign_amount = target_metadata.foreign_amount ?? null; // req.body.foreign_amount || null;
        const target_exchange_rate = target_metadata.exchange_rate ?? null; // req.body.exchange_rate || null;

        // --------------------------------------------------
        // checking stage
        
        // // 1. if target_account_id_from or target_account_id_to not exist in Account table, then return error
        // // a check both at the same time
        // // const stmt_check_account = db.prepare('SELECT COUNT(DISTINCT id) AS count FROM Accounts WHERE id IN(?, ?)');
        // // const stmt_check_account = db.prepare('SELECT COUNT(DISTINCT id) AS both_exist FROM Accounts WHERE id IN(?, ?)');

        // const result_check_account = stmt_check_account.get(target_account_id_from, target_account_id_to);
        // if (result_check_account.count != 2) {
        //     return res.status(422).json({
        //         status: "failed",
        //         message: "Invalid account IDs provided"
        //     });
        // }

        // b check one by one
        if ( !(target_account_id_from || target_account_id_to)) {
            return res.status(422).json({
                "status": "failed",
                "message": "Invalid account IDs provided"
            });
        }
        const stmt_check_account = db.prepare('SELECT COUNT(*) AS count FROM Accounts WHERE id = ?');
        const result_check_account_from = stmt_check_account.get(target_account_id_from);
        const result_check_account_to = stmt_check_account.get(target_account_id_to);
        if ( ! result_check_account_from || ! result_check_account_to) {
            return res.status(422).json({
                "status": "failed",
                "message": "Invalid account IDs provided"
            });
        }

        // 2. if amount is invalid (not a number or negative), then return error
        if (isNaN(req.body.amount) || req.body.amount < 0) {
            return res.status(422).json({
                "status": "failed",
                "message": "Invalid amount provided"
            });
        }
        const target_amount = parseInt(req.body.amount, 10);

        // 3. if date is invalid
        const check_target_date = new Date(target_date);
        if (isNaN(check_target_date.getTime())) {
            return res.status(422).json({
                "status": "failed",
                "message": "Invalid date provided"
            });
        }
        
        // insert stage
        const stmt1 = db.prepare(`INSERT INTO TransactionsJournal (description, created_at, metadata, is_deleted) 
                                    VALUES ( @description, @created_at, @metadata, @is_deleted)`);
        const stmt2 = db.prepare(`INSERT INTO TransactionsLedger 
            (transaction_id , date_of_transaction, account_id, amount, is_credit, currency, is_foreign, exchange_rate) 
            VALUES 
            (@transaction_id , @date_of_transaction, @account_id, @amount, @is_credit, @currency, @is_foreign, @exchange_rate)`);
            
        // insert action
        let info = null;
        try {
            info = insertTransaction(stmt1, stmt2, {
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
                is_foreign: target_is_foreign,
                foreign_amount: target_foreign_amount,
                exchange_rate: target_exchange_rate
            });
        }
        catch (error) {
            return res.status(422).json({ 
                "status": "failed", 
                "message": `insertion failed`, 
                "details": `SQLite ${error}`,
                "sqlaction": `ROLLBACK`, 
            });
        }

        if ( ! info || info[0].changes != 1 ) {
            return res.status(422).json({ 
                "status": "failed", 
                "message": `transaction record has not added`, 
            });
        }
        else {
            console.log(`info: ${JSON.stringify(info)}`);
            console.log(`Transaction inserted successfully with transaction_id: ${info[0].lastInsertRowid}`);
        }

        return res.status(200).json( { "message": `Transaction inserted successfully with transaction_id: ${info[0].lastInsertRowid}` } );
    }); // end post(/transaction)
    
    router.get('/demo/transaction', logger, async (req, res) => {
        return res.sendFile(path.join(__dirname, 'public', 'input-form.html'));
    }); // end get(/demo/transaction)
    
    router.post('/demo/transaction', logger, async (req, res) => {
        const data = req.body;
        console.log(`Received data: \n${data}`);
        console.log("Request Body: " + JSON.stringify(req.body, null, 2));
        
        return res.status(200).json({ 
            "status": "success", 
            "message": `data well received!` 
        });
    }); // end post(/demo/transaction)
    
    // --------------------------------------------------

    router.get('/account', logger, async (req, res) => {
        res.render('form/form-account', { title: "account" });
    }); // end get(/account)
    
    router.post('/account', logger, async (req, res) => {
        const data = req.body;
        console.log("Request Body: " + JSON.stringify(data, null, 2));

        const target_name = req.body.name;
        const target_account_type = req.body.account_type;
        const target_description = req.body.description;
        const target_open_balance = req.body.opening_balance || 0;
        const target_currency = req.body.currency || "HKD";
        const target_parent_id = req.body.parent_id;
        const target_created_at = new Date().toISOString().split('T')[0]; // new Date().toLocaleDateString();

        const target = {
            name: target_name, 
            account_type: target_account_type, 
            description: target_description,
            opening_balance: target_open_balance, 
            currency: target_currency, 
            parent_id: target_parent_id, 
            created_at: target_created_at
        };
        console.log(JSON.stringify(target, null, 2));
    
        const stmt = db.prepare('INSERT INTO Accounts (name, account_type, description, opening_balance, currency, parent_id, created_at) VALUES (@name, @account_type, @description, @opening_balance, @currency, @parent_id, @created_at)');
        let info = null;
        try {
            info = stmt.run(target);
        }
        catch (SqliteError) {
            return res.status(422).json({ 
                "status": "failed", 
                "message": `invalid information!  name: ${target_name}  description: ${target_description}`, 
                "details": `SQLite ${SqliteError}`
            });
        }
    
        if ( info && info.changes != 1 ) {
            return res.status(422).json({ 
                "status": "failed", 
                "message": `data received but invalid currency!  currency: ${target_name}  description: ${target_description}` 
            });
        }
        
        return res.status(200).json({ 
            "status": "success", 
            "message": `data well received!  new account: ${target_name}  description: ${target_description}` 
        });
    }); // end post(/account)

    // --------------------------------------------------

    router.get('/currency', logger, async (req, res) => {
        res.render(`form/form-currency`, { title: "currency form" } );
    }); // end get(/currency)
    
    router.post('/currency', logger, async (req, res) => {
        const data = req.body;
        console.log("Request Body: " + JSON.stringify(req.body, null, 2));

        const target_id = req.body.id;
        const target_description = req.body.description;

        // checking 
        // exist check
        const check_stmt = db.prepare('SELECT id FROM Currency WHERE id = ?').all(target_id);
        if ( check_stmt.length ) {
            return res.status(422).json({ 
                "status": "failed", 
                "message": `currency already exist!\ncurrency: ${target_id}\ndescription: ${target_description}`
            });
        }

        // validcy check
        const sample_ISO_code_5 = [
            {
                "code": "ARS", 
                "currency": "Argentine Peso",
                "region": "Argentina"
            },
            {
                "code": "CAD",
                "currency": "Canadian Dollar",
                "region": "Canada"
            },
            {
                "code": "IDR",
                "currency": "Rupiah",
                "region": "Indonesia"
            },
            {
                "code": "INR",
                "currency": "Indian Rupee",
                "region": "India"
            },
            {
                "code": "KRW",
                "currency": "South Korean Won",
                "region": "South Korea"
            }
        ];
        if ( !sample_ISO_code_5.some( obj => obj.code === target_id ) ) { // !sample_ISO_code_5.includes(target_id) only check value
            return res.status(422).json({ 
                "status": "failed", 
                "message": `unsupported currency.\ncurrency: ${target_id}\ndescription: ${target_description}`
            });
        }

        // insertion
        const stmt = db.prepare('INSERT INTO Currency (id, description) VALUES (@id, @description)');
        let info = null;
        try {
            info = stmt.run( { id: target_id, description: target_description } );
        }
        catch (SqliteError) {
            return res.status(422).json({ 
                "status": "failed", 
                "message": `data received but invalid currency!\ncurrency: ${target_id}\ndescription: ${target_description}`, 
                "details": `SQLite ${SqliteError}`
            });
        }
    
        if ( info && info.changes != 1 ) {
            return res.status(422).json({ 
                "status": "failed", 
                "message": `data received but invalid currency!\ncurrency: ${target_id}\ndescription: ${target_description}` 
            });
        }

        return res.status(200).json({ 
            "status": "success", 
            "message": `data well received!  new currency:\n ${target_id}\n description: ${target_description}`,
            "Content-Type": `application/json`
        });
    }); // end post(/currency)
    
    return router;
}; // end createRouter()

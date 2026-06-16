// officical
import express from 'express';

// local js
import logger from './logger.mjs';

// Whitelist of allowed tables for security
const ALLOWED_TABLES = [
    'AccountType',
    'Currency',
    'Accounts',
    'TransactionsLedger',
    'TransactionsJournal',
    'AccountBalance'
];

// Helper: Get column names from table pragma
function getColumnsFromPragma(db, tableName) {
    try {
        const pragma = db.prepare(`PRAGMA table_info(${tableName})`).all();
        return pragma.map(p => p.name);
    } catch (err) {
        return [];
    }
}

function buildWhereClause( query ){
    const whereDateBetween = query.DateBetween ?? 0 ; 
    // example: nearest_3_Month, year_to_date, month_to_date

    `AND TL.date_of_transaction >= DATE('now', '-3 months', 'start of month')`
    `AND TL.date_of_transaction <= DATE('now')`
}

export default function createRouter(db, __dirname) {
    const router = express.Router();

    router.get('/v1/', logger, async (req, res) => {
        res.status(200).json({
            status: "okay"
        });
    }); // end get(v1/)

    // --------------------------------------------------
    // general endpoint approach

    router.get('/v1/data', async (req, res) => {
        const table = req.query.table;
        const limit = Number(req.query.limit ?? 50);
        const sort = req.query.sort ?? 0;
        const where = buildWhereClause(req.query);
        const sql = `SELECT * FROM ${table} ${where} ORDER BY ${sort} LIMIT ?`;
        const rows = db.prepare(sql).all(...params, limit);
        res.json(rows);
    });

    // --------------------------------------------------

    router.get('/v1/currency', logger, async (req, res) => {
        const displayLimit = req.query.limit ?? 0;
        const target = req.query.targetCurrency ?? 0;
        
        let result;
        try {
            if ( displayLimit ) {
                const stmt = db.prepare(`SELECT * FROM Currency LIMIT ?`);
                result = stmt.all( displayLimit );
            }
            else if ( target ) {
                const stmt = db.prepare(`SELECT * FROM Currency WHERE id = ?`);
                result = stmt.all( target );
            }
            else {
                const stmt = db.prepare(`SELECT * FROM Currency`);
                result = stmt.all();    
            }
        }
        catch (sqlite_error) {
            console.error( "SQLite SELECT error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
        return res.json({ "status": "okay", "result": result});
    }); // end get(v1/currency)

    router.post('/v1/currency', logger, async (req, res) => {
        let result;
        try {
            const stmt = db.prepare(`INSERT INTO Currency VALUES (?, ?)`);
            result = stmt.run(req.body.id, req.body.description);
        }
        catch (sqlite_error) {
            console.error( "SQLite INSERT error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
        return res.json({ "status": "okay",message: "Currency added successfully" });
    }); // end post(v1/currency)

    router.put('/v1/currency', logger, async (req, res) => {
        let result;
        try {
            const stmt = db.prepare(`UPDATE Currency SET description = ? WHERE id = ?`);
            result = stmt.run(req.body.id, req.body.description);
        }
        catch (sqlite_error) {
            console.error( "SQLite UPDATE error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
        return res.json({ "status": "okay", message: "Currency updated successfully" });
    }); // end update(v1/currency)

    router.delete('/v1/currency', logger, async (req, res) => {
        let result;
        try {
            const stmt = db.prepare(`DELETE FROM Currency WHERE id = ?`);
            result = stmt.run(req.body.id);
        }
        catch (sqlite_error) {
            console.error( 'SQLite UPDATE error:', sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
        return res.json({ "status": "okay", message: "Currency deleted successfully" });
    }); // end delete(v1/currency)

    // --------------------------------------------------
    
    router.get('/v1/accounttype', logger, async (req, res) => {
        const displayLimit = req.query.limit ?? 0;
        const target = req.query.targetCurrency ?? 0;
        let result;
        try {
            if ( displayLimit ) {
                const stmt = db.prepare(`SELECT * FROM AccountType LIMIT ?`);
                result = stmt.all( displayLimit );
            }
            else if ( target ) {
                const stmt = db.prepare(`SELECT * FROM AccountType WHERE id = ?`);
                result = stmt.all( target );
            }
            else {
                const stmt = db.prepare(`SELECT * FROM AccountType`);
                result = stmt.all();    
            }
        }
        catch (sqlite_error) {
            console.error( "SQLite SELECT error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
        return res.json({ "status": "okay", "result": result});
    }); // end get(v1/accounttype)

    // --------------------------------------------------

    router.get('/v1/accounts', logger, async (req, res) => {
        const displayLimit = req.query.limit ?? 0;
        const target = req.query.targetCurrency ?? 0;
        let result;
        try {
            if ( displayLimit ) {
                const stmt = db.prepare(`SELECT * FROM Accounts LIMIT ?`);
                result = stmt.all( displayLimit );
            }
            else if ( target ) {
                const stmt = db.prepare(`SELECT * FROM Accounts WHERE id = ?`);
                result = stmt.all( target );
            }
            else {
                const stmt = db.prepare(`SELECT * FROM Accounts`);
                result = stmt.all();    
            }
        }
        catch (sqlite_error) {
            console.error( "SQLite SELECT error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
        return res.json({ "status": "okay", "result": result});
    }); // end get(v1/accounts)

    router.post('/v1/accounts', logger, async (req, res) => {
        let result;
        try {
            const stmt = db.prepare(`INSERT INTO Accounts VALUES (?, ?)`);
            result = stmt.run(req.body.id, req.body.description);
        }
        catch (sqlite_error) {
            console.error( "SQLite INSERT error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
        return res.json({ "status": "okay",message: "Accounts added successfully" });
    }); // end post(v1/accounts)

    router.put('/v1/accounts', logger, async (req, res) => {
        let result;
        try {
            const stmt = db.prepare(`UPDATE Accounts SET description = ? WHERE id = ?`);
            result = stmt.run(req.body.description, req.body.id);
        }
        catch (error) {
            console.error( "SQLite UPDATE error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
        return res.json({ "status": "okay", message: "Currency updated successfully" });
    }); // end update(v1/accounts)

    router.delete('/v1/accounts', logger, async (req, res) => {
        if ( false ) {
            try {
                const stmt = db.prepare(`DELETE FROM Accounts WHERE id = ?`);
                const result = stmt.run(req.body.id);
            }
            catch (sqlite_error) {
                console.error( 'SQLite UPDATE error:', sqlite_error.message );
                return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
            }
            return res.status(200).json({ "status": "okay", message: `Account ${req.body.id} deleted successfully` });
        }
        else {
            return res.status(200).json({ "status": "fail", message: "lack of authentication" });
        }
    }); // end delete(v1/accounts)

    // --------------------------------------------------

    router.get('/v1/transactionsjournal', logger, async (req, res) => {
        const displayAll = req.query.all ?? 0;
        const displayLimit = req.query.limit ?? 0;
        const targetId = req.query.targetId ?? 0;
        const metadataDetail = req.query.metadataDetail ?? {};
        const displayLatestMonth = req.query.displayLatestMonth ?? 0;
        const displayNearest3Month = req.query.displayNearest3Month ?? 0;
        const countMode = req.query.countMode ?? 0;
        const groupByMonth = req.query.groupByMonth ?? 0;

        let result;
        try {
            if ( displayAll ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsJournal`);
                result = stmt.all();
            }
            else if ( displayLimit ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsJournal LIMIT ?`);
                result = stmt.all( displayLimit );
            }
            else if ( targetId ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsJournal WHERE id = ?`);
                result = stmt.all( targetId );
            }
            else if ( displayLatestMonth ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsJournal 
                                            WHERE created_at >= date('now', 'start of month');`);
                    result = stmt.all();
            }
            else if ( displayNearest3Month && (countMode && groupByMonth) ) {
                const stmt = db.prepare(`SELECT COUNT(*) AS count, strftime('%Y-%m', created_at) AS date 
                                        FROM TransactionsJournal 
                                        WHERE created_at >= DATE('now', '-3 months', 'start of month')
                                            AND created_at <= DATE('now')
                                        GROUP BY date
                                        ORDER BY date ASC;
                                            `);
                result = stmt.all();
            }
            else if ( displayNearest3Month ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsJournal 
                                        WHERE created_at >= DATE('now', '-3 months', 'start of month')
                                            AND created_at <= DATE('now');`);
                result = stmt.all();
            }
            else {
                const stmt = db.prepare(`SELECT * FROM TransactionsJournal LIMIT 50`);
                result = stmt.all();    
            }
            return res.json(result);
            // return res.json({ "status": "okay", "result": `${result}`});
        }
        catch (sqlite_error) {
            console.error( "SQLite SELECT error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
    }); // end get(v1/transactionsjournal)
    
    // --------------------------------------------------
    
    router.get('/v1/transactionsledger', logger, async (req, res) => {
        const displayAll = req.query.all ?? 0;
        const displayLimit = req.query.limit ?? 0;
        const targetId = req.query.targetId ?? 0;
        const metadataDetail = req.query.metadataDetail ?? {};
        const displayLatestMonth = req.query.displayLatestMonth ?? 0;
        const displayNearest3Month = req.query.displayNearest3Month ?? 0;
        const graphForDemo = req.query.graphForDemo ?? 0;
        
        let result;
        try {
            if ( displayAll ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsLedger`);
                result = stmt.all();
            }
            else if ( displayLimit ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsLedger LIMIT ?`);
                result = stmt.all( displayLimit );
            }
            else if ( targetId ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsLedger WHERE id = ?`);
                result = stmt.all( targetId );
            }
            else if ( targetId && displayLimit ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsLedger WHERE id = ? LIMIT ?`);
                result = stmt.all( targetId, displayLimit );
            }
            else if ( displayLatestMonth ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsLedger 
                                        WHERE date_of_transaction >= date('now', 'start of month')`);
                result = stmt.all();
            }
            else if ( displayNearest3Month && graphForDemo ) {
                // stmt : getting and returning all the account name and their spending / earing amount in the previous 3 month
                const stmt = db.prepare(`SELECT ACCS.name AS account, 
                                        SUM( CASE WHEN TL.is_credit = 0 THEN amount ELSE 0 END ) - SUM(CASE WHEN TL.is_credit = 1 THEN amount ELSE 0 END) AS "total_amount"
                                        FROM TransactionsLedger AS TL LEFT JOIN Accounts AS ACCS
                                        WHERE TL.account_id = ACCS.id
                                            AND TL.date_of_transaction >= DATE('now', '-3 months', 'start of month')
                                            AND TL.date_of_transaction <= DATE('now')
                                            AND ACCS.account_type = 2
                                        GROUP BY account;
                                            `);
                result = stmt.all();
            }
            else if ( displayNearest3Month ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsLedger 
                                        WHERE date_of_transaction >= DATE('now', '-3 months', 'start of month')
                                            AND date_of_transaction <= DATE('now')`);
                result = stmt.all();
            }
            else {
                const stmt = db.prepare(`SELECT * FROM TransactionsLedger LIMIT 50`);
                result = stmt.all();    
            }
        }
        catch (sqlite_error) {
            console.error( "SQLite SELECT error:", sqlite_error.message );
            return res.status(400).json( { "status": "error", "sql-error-message": `${sqlite_error.message}` } );
        }
        return res.json( result );
    }); // end get(v1/transactionsledger)

    // --------------------------------------------------
    router.get('/v1/accountbalance', logger, async (req, res) => {
        const displayLimit = req.query.limit ?? 0;
        const targetId = req.query.targetCurrency ?? 0;
        let result;
        try {
            if ( displayLimit ) {
                const stmt = db.prepare(`SELECT * FROM AccountBalance LIMIT ?`);
                result = stmt.all( displayLimit );
            }
            else if ( targetId ) {
                const stmt = db.prepare(`SELECT * FROM AccountBalance WHERE id = ?`);
                result = stmt.all( targetId );
            }
            else {
                const stmt = db.prepare(`SELECT * FROM AccountBalance`);
                result = stmt.all();    
            }
        }
        catch (sqlite_error) {
            console.error( "SQLite SELECT error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
        return res.json({ "status": "okay", "result": result});
    }); // end get(v1/accountbalance)

    router.post('/v1/accountbalance', logger, async (req, res) => {
        const targetId = req.body.id ?? 0;
        let result;
        try {
            const checkExist = db.prepare(`SELECT count(*) FROM AccountBalance WHERE id = ?`).get( targetId );
            if ( checkExist ) {
                const stmt = db.prepare(`INSERT INTO AccountBalance VALUES (?, ?)`);
                result = stmt.run(req.body.id, req.body.description);
            }
            else {
                return res.json( { "status": "Not Found" } ) 
            }
        }
        catch (sqlite_error) {
            console.error( "SQLite INSERT error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
        return res.json({ "status": "okay", message: "Account Balance added successfully" });
    }); // end post(v1/accountbalance)

    // ##################################################
    // API Endpoints for Dynamic Query Display
    // beta stage

    // GET /tables - Return list of allowed tables
    router.get('/v1/tables', logger, (req, res) => {
        res.json({ tables: ALLOWED_TABLES });
    }); // end get(/v1/tables)

    // GET /query - Query data from selected table
    router.get('/v1/query', logger, (req, res) => {
        const table = req.query.table;

        // Validate table name against whitelist
        if (!table || !ALLOWED_TABLES.includes(table)) {
            return res.status(400).json({ error: 'Invalid or missing table name' });
        }

        try {
            const stmt = db.prepare(`SELECT * FROM ${table}`);
            const rows = stmt.all();
            
            // Get column names from result or pragma
            let columns = [];
            if (rows.length > 0) {
                columns = Object.keys(rows[0]);
            } else {
                columns = getColumnsFromPragma(db, table);
            }

            res.json({ columns, rows });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }); // end get(/v1/query)

    return router
}; // end createRouter()
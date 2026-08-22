// officical
import express from 'express';

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

// function buildWhereClause ( query ){
//     const table = req.query.table;
//     const whereDateBetween = query.DateBetween ?? 0 ;
//     // example: nearest_6_Month, nearest_3_month, year_to_date, month_to_date

//     const whereTargetField = query.whereTargetField ?? 0 ;
//     const whereTargetFieldValue = query.whereTargetFieldValue ?? 0 ;

//     let whereClause = "";
//     let flagStart = true;

//     if ( whereTargetField ) {
//         switch ( whereTargetField ) {
//             case "":
//                 break;
//             default:
//                 break;
//         }
//     }

//     if ( whereDateBetween ) {
//         switch (whereDateBetween) {
//         case "user":
//             if (table == "tj") {
//                 if (flagStart) whereClause += `created_at >= DATE('now', '-5 months', 'start of month') AND created_at <= DATE('now')`;
//                 else whereClause += `AND created_at >= DATE('now', '-5 months', 'start of month') AND created_at <= DATE('now')`
//             }
//             else if ( table == "tl") {
//                 if (flagStart) whereClause += `date_of_transaction >= DATE('now', '-5 months', 'start of month') AND date_of_transaction <= DATE('now')`;
//                 else whereClause += `AND date_of_transaction >= DATE('now', '-5 months', 'start of month') AND date_of_transaction <= DATE('now')`
//             }
//             break;
    
//         case "nearest_3_month":
//             if (table == "tj") {
//                 if (flagStart) whereClause += `created_at >= DATE('now', '-5 months', 'start of month') AND created_at <= DATE('now')`;
//                 else whereClause += `AND created_at >= DATE('now', '-5 months', 'start of month') AND created_at <= DATE('now')`
//             }
//             else if ( table == "tl") {
//                 if (flagStart) whereClause += `date_of_transaction >= DATE('now', '-5 months', 'start of month') AND date_of_transaction <= DATE('now')`;
//                 else whereClause += `AND date_of_transaction >= DATE('now', '-5 months', 'start of month') AND date_of_transaction <= DATE('now')`
//             }
    
//         case "year_to_date":
//             if (table == "tj") {
//                 if (flagStart) whereClause += `created_at >= DATE('now', '-5 months', 'start of month') AND created_at <= DATE('now')`;
//                 else whereClause += `AND created_at >= DATE('now', '-5 months', 'start of month') AND created_at <= DATE('now')`
//             }
//             else if ( table == "tl") {
//                 if (flagStart) whereClause += `date_of_transaction >= DATE('now', '-5 months', 'start of month') AND date_of_transaction <= DATE('now')`;
//                 else whereClause += `AND date_of_transaction >= DATE('now', '-5 months', 'start of month') AND date_of_transaction <= DATE('now')`
//             }
    
//         case "month_to_date":
//             if (table == "tj") {
//                 if (flagStart) whereClause += `created_at >= DATE('now', '-5 months', 'start of month') AND created_at <= DATE('now')`;
//                 else whereClause += `AND created_at >= DATE('now', '-5 months', 'start of month') AND created_at <= DATE('now')`
//             }
//             else if ( table == "tl") {
//                 if (flagStart) whereClause += `date_of_transaction >= DATE('now', '-5 months', 'start of month') AND date_of_transaction <= DATE('now')`;
//                 else whereClause += `AND date_of_transaction >= DATE('now', '-5 months', 'start of month') AND date_of_transaction <= DATE('now')`
//             }
    
//         default:
//             break;
//         }
//     }
// } // end buildWhereClause ()

export default function createRouter(db, logger, __dirname) {
    const router = express.Router();

    router.get('/v1/', logger, async (req, res) => {
        res.status(200).json({
            status: "okay"
        });
    }); // end get(v1/)

    // --------------------------------------------------
    // general endpoint approach

    // router.get('/v1/data', async (req, res) => {
    //     const table = req.query.table; // AccountType Currency Accounts TransactionsJournal TransactionsLedger
    //     const selectType = req.query.selectType; // selectALL countALL
    //     const limit = Number(req.query.limit ?? -1);
    //     const sort = req.query.sort ?? "id";
    //     const order  = req.query.order ?? "ASC";
    //     const where = buildWhereClause(req.query);
        
    //     let sql = "";
    //     if ( selectType === "selectALL" ) {
    //         sql += "SELECT * "
    //     }
    //     else if ( selectType === "countALL" ) {
    //         sql += "SELECT COUNT(*) "
    //     }
    //     else {
    //         return res.status(400).json({ "status": "error", "message": "unsupported selectType" });
    //     }

    //     if ( Array.isArray(table) ) {

    //     }

    //     if ( limit >= 0 ) {
    //         try {
    //             const sql = `SELECT * FROM ${table} ${where} ORDER BY ${sort} LIMIT ?`;
    //             const rows = db.prepare(sql).all(limit);
    //         }
    //         catch (sqlite_error) {
    //             console.error( "SQLite SELECT error:", sqlite_error.message );
    //             return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
    //         }
    //     }
    //     else {
    //         try {
    //             const sql = `SELECT * FROM ${table} ${where} ORDER BY ${sort}`;
    //             const rows = db.prepare(sql).all();
    //         }
    //         catch (sqlite_error) {
    //             console.error( "SQLite SELECT error:", sqlite_error.message );
    //             return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
    //         }
    //     }
    //     // const rows = db.prepare(sql).all(...params, limit);
    //     return res.json(rows);
    // });

    router.get('/v1/graph', async (req, res) => {
        const graphNO = parseInt(req.query.graphNO);
        console.log(graphNO);

        let stmt;
        let result;
        try {
            switch (graphNO) {
                case 1: // line chart for display trend year-till-date
                    console.log( "running 1" )
                    stmt = db.prepare(
`WITH RECURSIVE MonthTimeline(month_str) AS (
    -- 1. Start with the first month of the current year
    SELECT strftime('%Y-%m', 'now', 'start of year')
    UNION ALL
    -- 2. Increment month by month until we reach the current month
    SELECT strftime('%Y-%m', date(month_str || '-01', '+1 month'))
    FROM MonthTimeline
    WHERE month_str < strftime('%Y-%m', 'now')
),
MasterGrid AS (
    SELECT t.id AS account_type, m.month_str AS report_date
    FROM AccountType t
    CROSS JOIN MonthTimeline m
    on t.id IN (2, 5)
)
SELECT 
    G.account_type,
    G.report_date AS date,
    COALESCE(
        SUM(CASE WHEN TL.is_credit = 0 THEN TL.amount ELSE 0 END) - 
        SUM(CASE WHEN TL.is_credit = 1 THEN TL.amount ELSE 0 END), 
        0
    ) AS "total_amount"
FROM MasterGrid G
LEFT JOIN Accounts AS ACCS 
    ON G.account_type = ACCS.account_type
LEFT JOIN TransactionsLedger AS TL 
    ON ACCS.id = TL.account_id 
    AND strftime('%Y-%m', TL.date_of_transaction) = G.report_date
    AND TL.date_of_transaction <= DATE('now')
GROUP BY G.account_type, G.report_date
ORDER BY date ASC, G.account_type ASC;`);
                    result = stmt.all();
                    break;

                case 2: // previous 3 month account total amount of expense
                    console.log( "running 2" )
                    stmt = db.prepare(
`SELECT ACCS.name AS account, 
    SUM( CASE WHEN TL.is_credit = 0 THEN amount ELSE 0 END ) - SUM(CASE WHEN TL.is_credit = 1 THEN amount ELSE 0 END) AS "total_amount"
FROM TransactionsLedger AS TL LEFT JOIN Accounts AS ACCS
ON TL.account_id = ACCS.id
WHERE TL.date_of_transaction >= DATE('now', '-3 months', 'start of month')
    AND TL.date_of_transaction <= DATE('now')
    AND ACCS.account_type = 2
GROUP BY account;`);
                    result = stmt.all();
                    break;

                case 3: // year-till-date expense amount monthly
                    console.log( "running 3" )
                    stmt = db.prepare(
`SELECT 
    strftime('%Y-%m', date_of_transaction) AS date, 
    SUM( CASE WHEN TL.is_credit = 0 THEN amount ELSE 0 END ) - SUM( CASE WHEN TL.is_credit = 1 THEN amount ELSE 0 END ) AS "total_amount"
FROM TransactionsLedger AS TL LEFT JOIN Accounts AS ACCS
ON TL.account_id = ACCS.id
WHERE date_of_transaction >= DATE('now', 'start of year', 'start of month') AND date_of_transaction <= DATE('now')
    AND account_type = 2
GROUP BY date
ORDER BY date ASC;`);
                    result = stmt.all();
                    break;

                case 4: // asset overview   
                    console.log( "running 4" )
                    stmt = db.prepare(
`select AB.account_id, ACCS.name, sum(AB.balance) AS "balance", AB.currency, AB.updated_at
from accountbalance AS AB 
left join accounts AS ACCS 
ON AB.account_id = ACCS.id
group by AB.currency, ACCS.account_type
order by AB.account_id ASC, AB.currency ASC;`);
                    result = stmt.all();
                    break;

                default:
                    console.log( "running default" )
                    result = { "error": "bug here" };
                    break;
            }
        }
        catch (sqlite_error) {
            console.error( "SQLite SELECT error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }
        
        // const rows = db.prepare(sql).all(...params, limit);
        return res.json(result);
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
        const data = req.body;
        console.log("Request Body: " + JSON.stringify(req.body, null, 2));

        const target_id = req.body.currency_id;
        const target_description = req.body.currency_description;

        // checking 
        // exist check
        const check_stmt = db.prepare('SELECT id FROM Currency WHERE id = ?').all(target_id);
        if ( check_stmt.length ) {
            return res.status(422).json({ 
                "status": "failed", 
                "message": `currency already exist!\ncurrency: ${target_id}\ndescription: ${target_description}`
            });
        }

        // // validcy check
        // const sample_ISO_code_5 = [
        //     {
        //         "code": "ARS", 
        //         "currency": "Argentine Peso",
        //         "region": "Argentina"
        //     },
        //     {
        //         "code": "CAD",
        //         "currency": "Canadian Dollar",
        //         "region": "Canada"
        //     },
        //     {
        //         "code": "IDR",
        //         "currency": "Rupiah",
        //         "region": "Indonesia"
        //     },
        //     {
        //         "code": "INR",
        //         "currency": "Indian Rupee",
        //         "region": "India"
        //     },
        //     {
        //         "code": "KRW",
        //         "currency": "South Korean Won",
        //         "region": "South Korea"
        //     }
        // ];
        // if ( !sample_ISO_code_5.some( obj => obj.code === target_id ) ) { // !sample_ISO_code_5.includes(target_id) only check value
        //     return res.status(422).json({ 
        //         "status": "failed", 
        //         "message": `unsupported currency.\ncurrency: ${target_id}\ndescription: ${target_description}`
        //     });
        // }

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
        const interactableOnly = req.query.interactableOnly ?? 0;
        const count = req.query.count ?? 0;

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
            else if ( interactableOnly ) {
                const stmt = db.prepare(`SELECT ACCS.id, ACCS.name, AT.description, ACCS.currency FROM Accounts AS ACCS LEFT JOIN AccountType AS AT ON ACCS.account_type = AT.id`);
                result = stmt.all(  );
            }
            else if ( count ) {
                const stmt = db.prepare(`SELECT COUNT(*) AS count FROM Accounts`);
                result = stmt.get(  );
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
        return res.json( result );
    }); // end get(v1/accounts)

    router.get('/v1/accounts/test', logger, (req, res) => {
        const interactableOnly = req.query.interactableOnly ?? 0;

        // Validate table name against whitelist
        if ( !interactableOnly ) {
            return res.status(400).json({ error: 'use interactableOnly' });
        }

        let rows;
        let columns;
        try {
            // const stmt = db.prepare(`SELECT * FROM ${table}`);
            const stmt = db.prepare(`SELECT ACCS.id, ACCS.name, AT.description, ACCS.currency FROM Accounts AS ACCS LEFT JOIN AccountType AS AT ON ACCS.account_type = AT.id WHERE ACCS.id NOT IN (1, 2, 3, 4, 5, 9, 15, 17, 33)`);
            rows = stmt.all();
            
            // Get column names from result or pragma
            columns = [];
            if (rows.length > 0) {
                columns = Object.keys(rows[0]);
            } else {
                columns = getColumnsFromPragma(db, table);
            }
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json({ columns, rows });
    }); // end get(/v1/accounts/test)

    router.post('/v1/accounts', logger, async (req, res) => {
        const data = req.body;
        console.log("Request Body: " + JSON.stringify(data, null, 2));

        const target_name = req.body.account_name;
        const target_account_type = req.body.account_type;
        const target_description = req.body.account_description || "";
        const target_open_balance = req.body.account_opening_balance || 0;
        const target_currency = req.body.account_currency || "HKD";
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
    }); // end post(/v1/account)

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

    router.post('/v1/transactionsjournal', logger, async (req, res) => {
        console.log("Request Body: " + JSON.stringify(req.body, null, 2));

        const itemStart = req.body.item_start ?? 0;
        const displayLimit = req.query.limit ?? 0;
        const targetId = req.query.targetId ?? 0;
        const countMode = req.query.countMode ?? 0;
        const groupByMonth = req.query.groupByMonth ?? 0;
        const sort = req.query.sort_direction ?? 'ASC';

        let result;
        let stmtLine = '';
        if ( itemStart ) {
            stmtLine = stmtLine + `WHERE id = ?`;
        }
        if ( displayLimit ) {
            stmtLine = stmtLine + `LIMIT ?`;
        }

        try {
            if ( displayLimit ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsJournal LIMIT ?`);
                result = stmt.all( displayLimit );
            }
            else if ( targetId ) {
                const stmt = db.prepare(`SELECT * FROM TransactionsJournal WHERE id = ?`);
                result = stmt.all( targetId );
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
GROUP BY account;`);
                result = stmt.all();
            }
            else if ( displayNearest3Month ) {
                const stmt = db.prepare(`SELECT * 
FROM TransactionsLedger 
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

    router.post('/v1/transactions', logger, async (req, res) => {
        const data = req.body;
        console.log("info: Request Body: " + JSON.stringify(req.body, null, 2));
        const target_description = req.body.description ?? null;
        const target_date = req.body.transaction_date;
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
        if (isNaN(req.body.transaction_amount) || req.body.transaction_amount < 0) {
            return res.status(422).json({
                "status": "failed",
                "message": "Invalid amount provided"
            });
        }
        const target_amount = parseInt(req.body.transaction_amount, 10);

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

    router.put('/v1/accountbalance/calculate', logger, async (req, res) => {
        const stmt = db.prepare( 
`SELECT TL.account_id AS account_id, SUM( CASE WHEN TL.is_credit = 0 THEN amount ELSE 0 END ) - SUM( CASE WHEN TL.is_credit = 1 THEN amount ELSE 0 END ) AS "balance"
FROM TransactionsLedger AS TL LEFT JOIN Accounts AS ACCS
ON TL.account_id = ACCS.id
GROUP BY TL.account_id;` );
        let stmtresult = null;
        try {
            stmtresult = stmt.all();
        }
        catch (sqlite_error) {
            console.error( "SQLite INSERT error:", sqlite_error.message );
            return res.status(400).json({ "status": "error", "sql-error-message": `${sqlite_error.message}` });
        }

        if ( !stmtresult ) {
            console.log( "error: no record found in Account Balance. code: -4567" );
            return res.status(400).json({ "status": "error", "error-message": `${"no record"}` });
            process.exit(-4567);
        }

        const today = new Date().toISOString().split('T')[0];
        
        const rowMapperAccountBalance = (row) => ({
            "account_id": row.account_id,
            "balance": row.balance, // row.balance >= 0 ? row.balance : Math.abs(row.balance),
            "updated_at": today
        });

        let insertMany = db.transaction ( (rows, stmt) => {
            for ( const row of rows ) 
                stmt.run(row);
        });

        const dataBuffer = [];
        const updateSQL = db.prepare( 
`UPDATE AccountBalance
SET balance = @balance , updated_at = @updated_at
WHERE account_id = @account_id`);
            
        try {
            stmtresult.forEach(element => {
                element["balance"] = Math.round(element["balance"]);
                dataBuffer.push(rowMapperAccountBalance(element));
                insertMany(dataBuffer, updateSQL);
            });
        } 
        catch (error) {
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

        let rows;
        let columns;
        try {
            // const stmt = db.prepare(`SELECT * FROM ${table}`);
            let stmt;
            if ( table == "TransactionsLedger" ) {
                stmt = db.prepare(`SELECT TL.id, TL.transaction_id, TL.date_of_transaction, account_id, ACCS.name, TL.amount, is_credit, TL.currency, TL.is_foreign, TL.exchange_rate 
    FROM ${table} AS TL LEFT JOIN Accounts AS ACCS WHERE TL.account_id = ACCS.id `);
            }
            else {
                stmt = db.prepare(`SELECT * FROM ${table}`);
            }
            rows = stmt.all();
            
            // Get column names from result or pragma
            columns = [];
            if (rows.length > 0) {
                columns = Object.keys(rows[0]);
            } else {
                columns = getColumnsFromPragma(db, table);
            }
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
        return res.json({ columns, rows });
    }); // end get(/v1/query)

    return router
}; // end createRouter()
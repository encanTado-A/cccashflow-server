// officical
import express from 'express';

// local js
import logger from './logger.mjs';

// Whitelist of allowed tables for security
const ALLOWED_TABLES = [
    'AccountType',
    'Currency',
    'MoneyCategory',
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

export default function createRouter(db, __dirname) {
    const router = express.Router();

    router.get('/v1/', logger, async (req, res) => {
        res.status(200).json({
            status: "okay"
        });
    }); // end get(v1/)

    router.get('/v1/currency', logger, async (req, res) => {
        var stmt = db.prepare(`SELECT * FROM Currency`);
        var result = stmt.all();
            
        res.status(200).json(result);
    }); // end get(v1/currency)
    
    router.post('/v1/currency', logger, async (req, res) => {
        var flag_error = false;
        var stmt = db.prepare(`INSERT INTO Currency VALUES (?, ?)`);
        try {
            var result = stmt.run(req.body.id, req.body.description);
        }
        catch (sqlite_error) {
            console.error('SQLite error:', sqlite_error.message);
            flag_error = true;
        }
        
        if (flag_error) {
            res.status(400).json({ error: "Invalid request" });
            return;
        }
        res.status(200).json({ message: "Currency added successfully" });
    }); // end post(v1/currency)

    router.put('/v1/currency', logger, async (req, res) => {
        var flag_error = false;
        var stmt = db.prepare(`UPDATE Currency SET description = ? WHERE id = ?`);
        try {
            var result = stmt.run(req.body.description, req.body.id);
        }
        catch (sqlite_error) {
            console.error('SQLite error:', sqlite_error.message);
            flag_error = true;
        }

        if (flag_error) {
            res.status(400).json({ error: "Invalid request" });
            return;
        }
        res.status(200).json({ message: "Currency updated successfully" });
    }); // end update(v1/currency)

    router.delete('/v1/currency', logger, async (req, res) => {
        var flag_error = false;
        var stmt = db.prepare(`DELETE FROM Currency WHERE id = ?`);
        try {
            var result = stmt.run(req.body.id);
        }
        catch (sqlite_error) {
            console.error('SQLite error:', sqlite_error.message);
            flag_error = true;
        }
        
        if (flag_error) {
            res.status(400).json({ error: "Invalid request" });
            return;
        }
        res.status(200).json({ message: "Currency deleted successfully" });
    }); // end delete(v1/currency)

    // --------------------------------------------------
    
    router.get('/v1/accounttype', logger, async (req, res) => {
        var stmt = db.prepare(`SELECT * FROM AccountType`);
        var result = stmt.all();
            
        // console.log(`${result}`);
        res.status(200).json(result);
    }); // end get(v1/accounttype)

    router.get('/v1/moneycategory', logger, async (req, res) => {
        var stmt = db.prepare(`SELECT * FROM MoneyCategory`);
        var result = stmt.all();
            
        // console.log(`${result}`);
        res.status(200).json(result);
    }); // end get(v1/moneycategory)

    router.get('/v1/accounts', logger, async (req, res) => {
        var stmt = db.prepare(`SELECT * FROM Accounts`);
        var result = stmt.all();
            
        // console.log(`${result}`);
        res.status(200).json(result);
    }); // end get(v1/accounts)

    router.get('/v1/transactionsledger', logger, async (req, res) => {
        var stmt = db.prepare(`SELECT * FROM TransactionsLedger`);
        var result = stmt.all();
            
        // console.log(`${result}`);
        res.status(200).json(result);
    }); // end get(v1/transactionsledger)

    router.get('/v1/transactionsjournal', logger, async (req, res) => {
        var stmt = db.prepare(`SELECT * FROM TransactionsJournal`);
        var result = stmt.all();
            
        // console.log(`${result}`);
        res.status(200).json(result);
    }); // end get(v1/transactionsjournal)

    router.get('/v1/accountbalance', logger, async (req, res) => {
        var stmt = db.prepare(`SELECT * FROM AccountBalance`);
        var result = stmt.all();
            
        // console.log(`${result}`);
        res.status(200).json(result);
    }); // end get(v1/accountbalance)

    // ##################################################
    // API Endpoints for Dynamic Query Display

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
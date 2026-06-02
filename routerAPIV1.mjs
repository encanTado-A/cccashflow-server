// officical
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// local js
import logger from './logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function createRouter(db) {
    const router = express.Router();

    router.get('/v1/', logger, async (req, res) => {
        res.json({
            status: "demo"
        });
        // res.send(result);
    });

    router.get('/v1/demo/currency', logger, async (req, res) => {
        // demoConnectSqliteDB
        var stmt = db.prepare(`SELECT * FROM Currency`);
        var result = stmt.all();
            
        console.log(`${result}`);
        res.json(result);
    });

    router.get('/v1/demo/accounttype', logger, async (req, res) => {
        // demoConnectSqliteDB
        var stmt = db.prepare(`SELECT * FROM AccountType`);
        var result = stmt.all();
            
        console.log(`${result}`);
        res.json(result);
    });

    router.get('/v1/demo/accounts', logger, async (req, res) => {
        // demoConnectSqliteDB
        var stmt = db.prepare(`SELECT * FROM Accounts`);
        var result = stmt.all();
            
        console.log(`${result}`);
        res.json(result);
    });

    router.get('/v1/demo/transactionsledger', logger, async (req, res) => {
        // demoConnectSqliteDB
        var stmt = db.prepare(`SELECT * FROM TransactionsLedger`);
        var result = stmt.all();
            
        console.log(`${result}`);
        res.json(result);
    });

    router.get('/v1/demo/transactionsjournal', logger, async (req, res) => {
        // demoConnectSqliteDB
        var stmt = db.prepare(`SELECT * FROM TransactionsJournal`);
        var result = stmt.all();
            
        console.log(`${result}`);
        res.json(result);
    });

    router.get('/v1/demo/AccountBalance', logger, async (req, res) => {
        // demoConnectSqliteDB
        var stmt = db.prepare(`SELECT * FROM AccountBalance`);
        var result = stmt.all();
            
        console.log(`${result}`);
        res.json(result);
    });

    return router
}
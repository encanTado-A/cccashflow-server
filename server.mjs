// necessary library
// node.js native
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// external
import express from 'express';
import Database from 'better-sqlite3';
// import csv from 'csv-parser';
import env from 'dotenv';

// local js
import demoConnectSqliteDB from './demo-db.cjs';
import createRouterAdd from './routeradd.mjs';
import createRouterAPI from './routerAPIV1.mjs';
import logger from './logger.mjs';

/*
potential problem
path format difference on different OSes

*/

// ##################################################

env.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views')); 

// middleware
app.use(express.json()); // auto parse JSON  and places result object onto res.body
app.use(express.urlencoded({ extended: true })) // parse data submitted via HTML <form>



// ##################################################

let db = null;
try {
    console.log('DEMO_DATABASE_PATH=', process.env.DEMO_DATABASE_PATH);
    
    db = demoConnectSqliteDB(); // <-- call the function to get Database instance
    if (db && db.open) {
        console.log('status: db open');
        db.pragma('journal_mode = WAL'); // suggested from official for performance reasons
    } else {
        console.log('status: db is offline');
    }
}
catch (error) {
    console.error('status: Database connection failed:', error.message);
    process.exit(-1);
}


// ##################################################
// database query function


// ##################################################
// web access function

app.get('/', logger, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    // res.render('index.html', { username: 'Andrew' }); 
});

app.get('/test', logger, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
    // res.render('index.html', { username: 'Andrew' }); 
});

// --------------------------------------------------
// /add pages

// app.use( '/add', Router_add );
const routeradd = createRouterAdd(db);  // wire db into router
app.use('/add', routeradd);

// --------------------------------------------------
// api pages

const routerapiv1 = createRouterAPI(db);  // wire db into router
app.use('/api', routerapiv1);

// app.get('/api', logger, async (req, res) => {
//     res.json({
//         status: "demo"
//     });
//     // res.send(result);
// });

// app.get('/api/demo/currency', logger, async (req, res) => {
//     // demoConnectSqliteDB
//     var stmt = db.prepare(`SELECT * FROM Currency`);
//     var result = stmt.all();
        
//     console.log(`${result}`);
//     res.json(result);
//     // res.send(result);
// });

// app.get('/api/demo/accounttype', logger, async (req, res) => {
//     // demoConnectSqliteDB
//     var stmt = db.prepare(`SELECT * FROM AccountType`);
//     var result = stmt.all();
        
//     console.log(`${result}`);
//     res.json(result);
//     // res.send(result);
// });

// app.get('/api/demo/accounts', logger, async (req, res) => {
//     // demoConnectSqliteDB
//     var stmt = db.prepare(`SELECT * FROM Accounts`);
//     var result = stmt.all();
        
//     console.log(`${result}`);
//     res.json(result);
//     // res.send(result);
// });

// app.get('/api/demo/transactionsledger', logger, async (req, res) => {
//     // demoConnectSqliteDB
//     var stmt = db.prepare(`SELECT * FROM TransactionsLedger`);
//     var result = stmt.all();
        
//     console.log(`${result}`);
//     res.json(result);
//     // res.send(result);
// });

// app.get('/api/demo/transactionsjournal', logger, async (req, res) => {
//     // demoConnectSqliteDB
//     var stmt = db.prepare(`SELECT * FROM TransactionsJournal`);
//     var result = stmt.all();
        
//     console.log(`${result}`);
//     res.json(result);
//     // res.send(result);
// });

// app.get('/api/demo/AccountBalance', logger, async (req, res) => {
//     // demoConnectSqliteDB
//     var stmt = db.prepare(`SELECT * FROM AccountBalance`);
//     var result = stmt.all();
        
//     console.log(`${result}`);
//     res.json(result);
//     // res.send(result);
// });

// --------------------------------------------------

// web access
// app.listen(process.env.PORT, () => {
//     console.log(`Server is running on http://${process.env.DEMO_WEB_IP}:${process.env.DEMO_PORT}`)
// });

app.listen(process.env.DEMO_PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${process.env.DEMO_PORT}`)
});

// ##################################################

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully.');
  db.close();
  process.exit(0);
//   server.close(() => {
//     console.log('HTTP server closed.');
//     // Close database connections or other resources here
//   });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received.');
  console.log('HTTP server closed.');
  db.close();
  console.log('database server closed.');
  process.exit(0);
//   server.close(() => {
//   });
});
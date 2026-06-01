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
// import demo_db from './demo-db.js';

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

// a console logger to view success request (TicketX)
const logger = (req, res, next) => {
    const method = req.method;
    const url = req.url;
    // const year = new Date().getFullYear();
    // const month = new Date().getUTCMonth() + 1;
    // const day = new Date().getUTCDate();
    // console.log(`${method} ${url} ${year}-${month}-${day}`);
    const date = new Date();
    console.log(`${date} ${method} ${url}`);
    next();
}

// middleware
app.use(express.json()); // auto parse JSON  and places result object onto res.body
app.use(express.urlencoded({ extended: true })) // parse data submitted via HTML <form>

// ##################################################

let db = null;
// db = demo_db.demoConnectSqliteDB;
let flag_connection = false;

try {
    const db_file_path = process.env.DEMO_DATABASE_PATH;
    if ( ! fs.existsSync( db_file_path ) ) {
        console.log(`File in path ${db_file_path} does not exists`);
        process.exit(-1);
    }
    
    db = new Database(db_file_path, { verbose: console.log, fileMustExist: true});

    flag_connection = true;
}
catch (error) {
    console.error('Database connection failed:', error.message);
    flag_connection = false;
    process.exit(1);
}
finally {
    flag_connection ? console.log(`connection made`) 
        : console.log(`connection failed`);
}

if ( db && db.open ) {
    console.log('db open');
    db.pragma('journal_mode = WAL'); // suggested from official for performance reasons
}
else {
    console.log('db is offline');
}

// ##################################################
// database query function


// ##################################################
// web access function

app.get('/', logger, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    // res.render('index.html', { username: 'Andrew' }); 
});

app.get('/add/transaction', logger, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'input-form.html'));
});

app.post('/add/add-transaction', logger, async (req, res) => {
    // The JSON data is now available cleanly inside req.body
    const data = req.body;
    // console.log(`Received username: ${data[username]}, email: ${data[email]}`);
    console.log(`Received data: \n${data}`);
    console.log("Request Body: " + JSON.stringify(req.body, null, 2));
    // --- DO YOUR ACTION HERE ---
    // Example: INSERT INTO Users (username, email) VALUES (?, ?)
    
    // Send a JSON response back to the frontend
    res.status(200).json({ 
        status: "success", 
        message: `data well received!` 
    });
});

app.get('/add/currency', logger, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'new-currency.html'));
});

app.post('/add/currency', logger, async (req, res) => {
    // The JSON data is now available cleanly inside req.body
    const data = req.body;
    const target_id = req.body.id;
    const target_description = req.body.description;

    console.log("Request Body: " + JSON.stringify(req.body, null, 2));

    // --- INSERT INTO Currency (id, description) VALUE (@id, @description) ---
    // const stmt = db.prepare('INSERT INTO Currency (id, description) VALUE (@id, @description)');
    // const info = db.run();
    const info = 0;

    // if ( info.changes != 1 ) {
    //     res.status(200).json({ 
    //         status: "failed", 
    //         message: `data received but invalid currency!  currency: ${target_id}  description: ${target_description}` 
    //     });
    // }
    
    // Send a JSON response back to the frontend
    res.status(200).json({ 
        status: "success", 
        message: `data well received!  new currency: ${target_id}  description: ${target_description}` 
    });
});

app.get('/api', logger, async (req, res) => {
    res.json({
        status: "demo"
    });
    // res.send(result);
});

app.get('/api/demo/currency', logger, async (req, res) => {
    // demoConnectSqliteDB
    var stmt = db.prepare(`SELECT * FROM Currency`);
    var result = stmt.all();
        
    console.log(`${result}`);
    res.json(result);
    // res.send(result);
});

app.get('/api/demo/accounttype', logger, async (req, res) => {
    // demoConnectSqliteDB
    var stmt = db.prepare(`SELECT * FROM AccountType`);
    var result = stmt.all();
        
    console.log(`${result}`);
    res.json(result);
    // res.send(result);
});

app.get('/api/demo/accounts', logger, async (req, res) => {
    // demoConnectSqliteDB
    var stmt = db.prepare(`SELECT * FROM Accounts`);
    var result = stmt.all();
        
    console.log(`${result}`);
    res.json(result);
    // res.send(result);
});

app.get('/api/demo/transactionsledger', logger, async (req, res) => {
    // demoConnectSqliteDB
    var stmt = db.prepare(`SELECT * FROM TransactionsLedger`);
    var result = stmt.all();
        
    console.log(`${result}`);
    res.json(result);
    // res.send(result);
});

app.get('/api/demo/transactionsjournal', logger, async (req, res) => {
    // demoConnectSqliteDB
    var stmt = db.prepare(`SELECT * FROM TransactionsJournal`);
    var result = stmt.all();
        
    console.log(`${result}`);
    res.json(result);
    // res.send(result);
});

app.get('/api/demo/AccountBalance', logger, async (req, res) => {
    // demoConnectSqliteDB
    var stmt = db.prepare(`SELECT * FROM AccountBalance`);
    var result = stmt.all();
        
    console.log(`${result}`);
    res.json(result);
    // res.send(result);
});

// web access
app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://${process.env.WEB_TEST_IP}:${process.env.PORT}`)
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
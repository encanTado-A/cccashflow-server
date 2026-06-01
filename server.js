// necessary library
// node native
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// external
import express from 'express';
import Database from 'better-sqlite3';
// import csv from 'csv-parser';
import env from 'dotenv';

// local js
// import db from './demo-db.js';

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
// app.set('view engine', 'ejs');

// a console logger to view success request (TicketX)
const logger = (req, res, next) => {
    const method = req.method;
    const url = req.url;
    const year = new Date().getFullYear();
    const month = new Date().getUTCMonth() + 1;
    const day = new Date().getUTCDate();
    console.log(`${method} ${url} ${year}-${month}-${day}`);
    next();
}

// middleware
app.use(express.json());

// ##################################################

let db = null;
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
});

app.get('/add-transaction', logger, async (req, res) => {
    res.send('Hello World');
});

app.post('/add-transaction', (req, res) => {
    res.send('Hello World');
});

app.get('/db-test/currency', logger, async (req, res) => {
    // demoConnectSqliteDB
    const stmt = db.prepare(`SELECT * FROM Currency`);
    const result = stmt.all();
        
    console.log(`${result}`);
    res.json(result);
    // res.send(result);
});

// web access
app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://${process.env.WEB_TEST_IP}:${process.env.PORT}`)
});
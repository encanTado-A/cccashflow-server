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
import Chart from 'chart.js/auto';

// local js
import logger from './logger.mjs';
import demoConnectSqliteDB from './demo-db.cjs';
import testConnectSqliteDB from './test-db-connect.cjs';
import createRouterAdd from './router-add.mjs';
import createRouterAPI from './router-API-V1.mjs';
import createRouterView from './router-view.mjs';

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
app.set( 'view engine', 'ejs' );
app.set( 'views', path.join(__dirname, 'src', 'views') );
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use( express.static(path.join(__dirname, 'public'), { index: false }) );

// middleware
app.use(express.json()); // auto parse JSON  and places result object onto res.body
app.use(express.urlencoded({ extended: true })) // parse data submitted via HTML <form>

// ##################################################
const args = process.argv || 0;

const isHelp = args.includes('--help') || args.includes('-h');
if (isHelp) {
    console.log( `--demo / -d \t\t : program will start in demo setting, including demo database` );
    console.log( `--test / -t \t\t : program will start in test setting, including testing database` );
    console.log( `--verbose / -v \t\t : database will be verbose` );

    process.exit(0);
}
const flagDemo = args.includes('--demo') || args.includes('-d');
const flagTest = args.includes('--test') || args.includes('-t');
const flagVerbose = args.includes('--verbose') || args.includes('-v');
const flagproduction = ! (flagDemo || flagTest);

// ##################################################

let db = null;
try {
    // console.log('DEMO_DATABASE_PATH=', process.env.DEMO_DATABASE_PATH);
    
    if (flagDemo) {
        db = demoConnectSqliteDB( flagVerbose ); // <-- call the function to get Database instance
    }
    else if (flagTest) {
        db = testConnectSqliteDB( flagVerbose ); // <-- call the function to get Database instance
    }
    // db = connectSqliteDB(); // <-- call the function to get Database instance

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
// web access function

app.get('/', logger, async (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'index.html'));
    res.render('index', { title: 'Home', username: 'Andrew' }); 
});

app.get('/test', logger, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.get('/testejs', logger, async (req, res) => {
    res.render('test', { title: 'Home', username: 'Andrew' });
}); 

// --------------------------------------------------
// /add pages

const router_add = createRouterAdd(db, __dirname);  // wire db into router
app.use('/add', router_add);

// --------------------------------------------------
// view pages

const router_view = createRouterView(db, __dirname);  // wire db into router
app.use('/view', router_view);

// --------------------------------------------------
// api pages

const router_apiv1 = createRouterAPI(db, __dirname);  // wire db into router
app.use('/api', router_apiv1);

// --------------------------------------------------


// web access
if (flagproduction) {
    app.listen(8000, () => {
        console.log(`Server is running on http://localhost:8000`)
    });

}
else if (flagDemo || flagTest) {
    app.listen(process.env.DEMO_PORT, () => {
        console.log(`Server is running on http://${process.env.DEMO_WEB_IP}:${process.env.DEMO_PORT}`)
    });
}

// ##################################################

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully.');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received.');
  console.log('HTTP server closed.');
  db.close();
  console.log('database server closed.');
  process.exit(0);
});
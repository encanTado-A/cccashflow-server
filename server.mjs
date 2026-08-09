// ----- necessary library -----
// node.js native
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ----- external -----
import express from 'express';
import Database from 'better-sqlite3';
// import csv from 'csv-parser';
import env from 'dotenv';
import Chart from 'chart.js/auto';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import session from 'express-session';
// import cookieParser from 'cookie-parser';

// ----- local js -----

// middleware
import logger from './middleware/logger.mjs';
import utili_sqlite from './db/utili-sqlite.mjs';

// auth
import initializePassport from './auth/passport.mjs';
import auth_check from './middleware/auth-check.cjs';

// router
import createRouterAdd from './router/router-add.mjs';
import createRouterAPI from './router/router-API-V1.mjs';
import createRouterView from './router/router-view.mjs';

// demo / test only
import demoConnectSqliteDB from './set-up/demo/demo-db.cjs';
import testConnectSqliteDB from './set-up/test/test-db-connect.cjs';

import createRouterTest from './router/router-test.mjs';
import auth_check_test from './middleware/auth-check-test.cjs';

// ##################################################

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
env.config( {path: path.resolve('./.env') } );

// view engine
app.set( 'view engine', 'ejs' );
app.set( 'views', path.join(__dirname, 'src', 'views') );
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use( express.static(path.join(__dirname, 'public'), { index: false }) );

// middleware
app.use(express.json()); // auto parse JSON  and places result object onto res.body
app.use(express.urlencoded({ extended: true })) // parse data submitted via HTML <form>
// app.use(cookieParser());
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.query) {
    req.method = req.query._method.toUpperCase();
    delete req.body._method; // clean up so it doesn't affect your controllers
  }
  next();
});

// ##################################################
// handle command options

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
// get database connection

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

// utili program
const utiliSqlite = utili_sqlite(db);

// ##################################################
// passport and local strategy

let salt = null;
if ( flagDemo || flagTest ) {
    salt = 10;
}
else {
    salt = await bcrypt.genSalt(10);
}

initializePassport(passport, bcrypt, utiliSqlite);

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ##################################################
// web access function

app.get('/', logger, async (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'index.html'));
    res.render('index', { title: 'Home', username: 'Andrew' }); 
});

// --------------------------------------------------
// /add pages

const router_add = createRouterAdd(db, logger, __dirname);  // wire db into router
app.use('/add', router_add);

// --------------------------------------------------
// view pages

const router_view = createRouterView(db, logger, __dirname);  // wire db into router
app.use('/view', router_view);

// --------------------------------------------------
// api pages

const router_apiv1 = createRouterAPI(db, logger, __dirname);  // wire db into router
app.use('/api', router_apiv1);

// --------------------------------------------------
// test pages

const router_test = createRouterTest(express, db, passport, bcrypt, salt, logger, auth_check_test);  // wire db into router
app.use('/test', router_test);

// --------------------------------------------------

// web access
if ( flagproduction ) {
    app.listen(8000, () => {
        console.log(`Server is running on http://localhost:8000`)
    });

}
else if ( flagDemo || flagTest ) {
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
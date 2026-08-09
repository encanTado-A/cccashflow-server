// Cjs
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
// const env = require('dotenv');

// env.config();
// require env setting


const table_name = [
    `Currency`,
    `AccountType`,
    `Accounts`,
    `TransactionJournal`,
    `TransactionLedger`,
    `AccountBalanace`,
    `Users`,
];

// ##################################################

const __root = path.join(__dirname, "../../..");
let db = null;

function demoConnectSqliteDB (verbose) {
    console.log("status: call from test-db-connect.cjs");
    const db_file_name = process.env.TEST_DATABASE_FILENAME
    const db_file_path = path.join(__root, "databases", db_file_name);
    console.log(`status: connecting to ${db_file_name}`);
    try {
        if ( ! fs.existsSync( db_file_path ) ) {
            console.log('status: database file does not exists');
            process.exit(-1);
        }
        
        if ( verbose ) {
            db = new Database(db_file_path, { verbose: console.log, fileMustExist: true});
        }
        else {
            db = new Database(db_file_path, { fileMustExist: true});
        }
    }
    catch (error) {
        console.error('status: Database connection failed:', error.message);
        process.exit(-1);
    }
    finally {
        console.log('status: finish demoConnectSqliteDB');
    }
    return db;
}; // end demoConnectSqliteDB()

module.exports = demoConnectSqliteDB;
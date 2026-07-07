// Cjs
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
// const env = require('dotenv');

// env.config();

const demo_table_name = [
    `Currency`,
    `AccountType`,
    `MoneyCategory`,
    `Accounts`,
    `AccountBalanace`,
    `TransactionJournal`,
    `TransactionLedger`,
];

// ##################################################

let db = null;

const demoConnectSqliteDB = (verbose) => {
    console.log("status: call from test-db-connect.cjs");
    console.log(`status: connecting to ${process.env.TEST_DATABASE_FILENAME}`);
    try {
        const db_file_path = path.join(process.env.TEST_DATABASE_PATH, process.env.TEST_DATABASE_FILENAME);

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
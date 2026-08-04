// Cjs
const Database = require('better-sqlite3');
const fs = require('fs');
// const path = require('path');
// const env = require('dotenv');

// env.config();

const post_path = 'F:\\devp\\cccashflow\\databases\\';
const demo_filename = [
    `demo.db`,
    `demo-account-type.csv`,
    `demo-accounts.csv`,
    `demo-currency.csv`,
    `demo-money-category.csv`,
];

const demo_table_name = [
    `Currency`,
    `AccountType`,
    `MoneyCategory`,
    `Accounts`,
    `AccountBalanace`,
    `TransactionJournal`,
    `TransactionLedger`,
];

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

let db = null;

const demoConnectSqliteDB = () => {
    console.log("status: call from demo-db.js");
    try {
        // const db_file_path = path.join(__dirname, "database", demo_filename[0]);
        const db_file_path = process.env.DEMO_DATABASE_PATH;
        if ( ! fs.existsSync( db_file_path ) ) {
            console.log('status: database file does not exists');
            process.exit(-1);
        }
        
        db = new Database(db_file_path, { verbose: console.log, fileMustExist: true});
                
        // for (let i = 0; i < demo_filename.length; i++) {
        //     console.log(`${i}th filename:\t\t${ post_path+demo_filename[i] }`)
        // };
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
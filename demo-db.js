// Cjs
const Database = require('better-sqlite3');
const fs = require('fs');

// check db exist
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

const demoConnectSqliteDB = async () => {
    try {
        const db_file_path = post_path+demo_filename[0];
        if ( ! fs.existsSync( db_file_path ) ) {
            console.log('File does not exists');
            process.exit()
        }
        
        const db = new Database(db_file_path, { verbose: console.log, fileMustExist: true});
        if ( db && db.open ) {
            console.log('db open');
        }
        // const Database = require('better-sqlite3')(db_file_path, { verbose: console.log });
        
        for (let i = 0; i < demo_filename.length; i++) {
            console.log(`${i}th filename:\t\t${ post_path+demo_filename[i] }`)
        };
    }
    catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
    finally {
        console.log(`finish demoConnectSqliteDB`);
    }
};

module.exports = db;
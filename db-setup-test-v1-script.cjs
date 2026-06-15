// necessary library
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('node:path');
const url = require('node:url');
const env = require('dotenv');

env.config();

// ##################################################
// path and filename definition

const demo_database_name = process.env.TEST_DATABASE_FILENAME_v1;

const demo_table_name = [
    `Currency`,
    `AccountType`,
    `Accounts`,
    `TransactionJournal`,
    `TransactionLedger`,
    `AccountBalanace`,
];

// ##################################################
// check db exist

const __root = path.join(__dirname, "..");
const db_file_path = path.join(__root, "databases", demo_database_name);
if (! fs.existsSync( db_file_path )) {
    console.log( `db file for path ${db_file_path} does not exists` );
    process.exit(-1);
}

let db = null;
try {
    db = new Database(db_file_path, { verbose: console.log });
    if ( db && db.open) {
        console.log('db open');
    }
}
catch (e) {
    console.log(`db open error: ${e}`);
    process.exit(-1);
}

// ##################################################
// create tables

const tableAccountType = db.prepare( "CREATE TABLE IF NOT EXISTS AccountType (id INTEGER PRIMARY KEY , description VARCHAR(16));" );
const tableCurrency = db.prepare( "CREATE TABLE IF NOT EXISTS Currency (id CHAR(3) NOT NULL PRIMARY KEY, description VARCHAR(64));" );


const tableAccounts = db.prepare( `CREATE TABLE IF NOT EXISTS Accounts (
    id INTEGER PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    account_type INT NOT NULL,
    description TEXT,
    opening_balance DECIMAL(15, 2) DEFAULT 0,
    currency CHAR(3) NOT NULL, 
    parent_id INTEGER, 
    created_at DATE NOT NULL,

    FOREIGN KEY (account_type) REFERENCES AccountType(id),
    FOREIGN KEY (currency) REFERENCES Currency(id)
    );` );

// transaction
const tableTransactionJournal = db.prepare( `CREATE TABLE IF NOT EXISTS TransactionsJournal (
    id INTEGER PRIMARY KEY, 
    description TEXT, 
    created_at DATE NOT NULL, 
    metadata TEXT, 
    is_deleted BOOLEAN NOT NULL DEFAULT 0
    );` ); 

const tableTransactionLedger = db.prepare( `CREATE TABLE IF NOT EXISTS TransactionsLedger (
    id INTEGER PRIMARY KEY, 
    transaction_id INTEGER NOT NULL, 
    date_of_transaction DATE NOT NULL, 
    account_id INTEGER NOT NULL, 
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0, 
    is_credit BOOLEAN NOT NULL, 
    currency CHAR(3) NOT NULL DEFAULT “HKD”, 
    is_foreign BOOLEAN NOT NULL,
    exchange_rate DECIMAL(9, 2), 

    FOREIGN KEY (transaction_id) REFERENCES TransactionsJournal(id),
    FOREIGN KEY (account_id) REFERENCES Accounts(id),
    FOREIGN KEY (currency) REFERENCES Currency (id)
    );` );

const tableAccountBalance = db.prepare( `CREATE TABLE IF NOT EXISTS AccountBalance (
    id INTEGER PRIMARY KEY, 
    account_id INTEGER NOT NULL, 
    balance DECIMAL(15, 2), 
    currency CHAR(3) NOT NULL DEFAULT “HKD”, 
    updated_at DATE NOT NULL, 

    FOREIGN KEY (account_id) REFERENCES Accounts(id),
    FOREIGN KEY (currency) REFERENCES Currency (id)
    );` );

// init tables function
const setupDatabaseTable = db.transaction( () => {
    // Open/Create the database file
    let info1 = null;
    // info table
    info1 = tableAccountType.run();
    info1 = tableCurrency.run();
    info1 = tableAccounts.run();
    // transaction table
    info1 = tableTransactionJournal.run();
    info1 = tableTransactionLedger.run();
    // temp bal table
    info1 = tableAccountBalance.run();

    return info1;
});

if ( db != null ) {
    try {
        const setupDB = setupDatabaseTable();
        const checking = db.prepare("SELECT sql FROM sqlite_schema WHERE type IN ('table', 'index') AND sql NOT NULL;").all();
        console.log(`.schema: \n${JSON.stringify(checking, null, 2)}`)
    }
    catch (e) {
        console.log( `create new table error\nsqlite: ${e}` );
    }
}

console.log('script finish');
// i guess like memory allocaiton you need manually "delete" it
// db.close();
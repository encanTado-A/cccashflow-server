// necessary library
const path = require('node:path');
const Database = require('better-sqlite3');
const fs = require('fs');
const url = require('node:url');
const csv = require('csv-parser');
const env = require('dotenv');

env.config();
// require env setting
// TEST_DATABASE_FILENAME
// DEMO_CURRENCY_CSV,
// DEMO_ACCOUNTTYPE_CSV,
// DEMO_ACCOUNTS_CSV,
// TEST_V1_TRANSACTIONSJOURNAL_CSV,
// TEST_V1_TRANSACTIONSLEDGER_CSV,


// ##################################################

// // read a csv
// const results = [];
// fs.createReadStream('../databases/demo-accounts.csv')
//     .pipe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', () => {
//       console.log(results);
//     });`

// ##################################################

// custom Error type
class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message); // Pass message to native Error constructor
    this.name = this.constructor.name; // Set custom error name
    this.statusCode = statusCode; // Add custom metadata
    Error.captureStackTrace(this, this.constructor); // Maintain clean stack trace
  }
}

// ##################################################
// script argument for custom import

const args = process.argv || 0;

const isHelp = args.includes('--help') || args.includes('-h');
if (isHelp) {
    console.log( `--all / -a \t\t : program will insert all the record found in the csv` );
    console.log( `--view / -v \t\t : program will NOT run any insertion from the csv` )
    console.log( `-TC \t\t\t : insert for table Currency` );
    console.log( `-TAT \t\t\t : insert for table AccountType` );
    console.log( `-TA \t\t\t : insert for table Accounts` );
    console.log( `-TJ \t\t\t : insert for table TransactionsJournal` );
    console.log( `-TL \t\t\t : insert for table TransactionsLedger` );
    console.log( `-AB \t\t\t : insert for table AccountBalance [not ready]` );
    
    process.exit(0);
}

const flag_run_craete_all_table = args.includes('--all') || args.includes('-a');
const flag_view_only = (! args.includes('--all') && ! args.includes('-a')) && (args.includes('--view') || args.includes('-v'));
if ( flag_view_only ) {
    console.log("no insertion would be made");
}

const isInsertCurrency = args.includes('-TC') ?? 0;
const isInsertAccountType = args.includes('-TAT') ?? 0;
const isInsertAccounts = args.includes('-A') ?? 0;
const isInsertTransactionsJournal = args.includes('-TJ') ?? 0;
const isInsertTransactionsLedger = args.includes('-TL') ?? 0;
const isInsertAccountBalance = args.includes('-AB') ?? 0;


// ##################################################

// __filename __dirname given in cjs
const __root = path.join(__dirname, "..");

// ##################################################
// path and filename definition

const demo_database_name = process.env.TEST_DATABASE_FILENAME;

const demo_filename = [
    process.env.DEMO_CURRENCY_CSV,
    process.env.DEMO_ACCOUNTTYPE_CSV,
    process.env.DEMO_ACCOUNTS_CSV,
    process.env.TEST_V1_TRANSACTIONSJOURNAL_CSV,
    process.env.TEST_V1_TRANSACTIONSLEDGER_CSV,
    // process.env.TEST_V1_AccountBalance_CSV,
];


const demo_table_name = [
    `Currency`,
    `AccountType`,
    `Accounts`,
    `TransactionJournal`,
    `TransactionLedger`,
    `AccountBalance`,
];

const db_file_path = path.join(__root, "databases", demo_database_name);
if (! fs.existsSync( db_file_path )) {
    console.log('database file does not exists');
    process.exit(-1);
}

if ( flag_view_only ) {
    console.log( "table can be created: " );
    for (let i = 0; i < demo_table_name.length; i++) {
        console.log(`\t\t${ demo_table_name[i] }`);
    };
}

// ##################################################
// check db exist

let db = null;
try {
    // db = new Database(db_file_path, { verbose: console.log });
    db = new Database(db_file_path);
    if ( db && db.open) {
        console.log('db open');
    }
}
catch (e) {
    console.log(`db open error: ${e}`);
    process.exit(-1);
}

if ( flag_run_craete_all_table ) {
    console.log( "\ntable to be imported: " );
    for (let i = 0; i < demo_table_name.length; i++) {
        console.log(`\t\t${ demo_table_name[i] }`);
    };
}
else {
    if (isInsertCurrency) console.log(`\t\t${ demo_table_name[0] }`);
    if (isInsertAccountType) console.log(`\t\t${ demo_table_name[1] }`);
    if (isInsertAccounts) console.log(`\t\t${ demo_table_name[2] }`);
    if (isInsertTransactionsJournal) console.log(`\t\t${ demo_table_name[3] }`);
    if (isInsertTransactionsLedger) console.log(`\t\t${ demo_table_name[4] }`);
    // if (isInsertAccountBalance) console.log(`\t\t${ demo_table_name[5] }`);
}

// init tables
// call db-setpup script

// ##################################################
// read csv data and insert into db

// v2 : smarter approach
let tableCurrencystmt = db.prepare(`INSERT INTO Currency (id, description) VALUES (@id, @description)`);
let tableAccountTypestmt = db.prepare(`INSERT INTO AccountType (id, description) VALUES (@id, @description)`);
let tableAccountstmt = db.prepare(`INSERT INTO Accounts 
        (name, account_type, description, opening_balance, currency, parent_id, created_at) 
        VALUES (@name, @account_type, @description, @opening_balance, @currency, @parent_id, @created_at)`);
let tableTransactionsJournalstmt = db.prepare(`INSERT INTO TransactionsJournal 
    (id, description, metadata, created_at, is_deleted) 
    VALUES (@id, @description, @metadata, @created_at, @is_deleted)`);
let tableTransactionsLedgerstmt = db.prepare(`INSERT INTO TransactionsLedger 
    (id, transaction_id, date_of_transaction, account_id, amount, is_credit, currency, is_foreign, exchange_rate) 
    VALUES (@id, @transaction_id, @date_of_transaction, @account_id, @amount, @is_credit, @currency, @is_foreign, @exchange_rate)`);

const CSVCurrencyPath = path.join( __root, "databases",  demo_filename[0]);
const CSVAccountTypePath = path.join( __root, "databases",  demo_filename[1]);
const CSVAccountPath = path.join( __root, "databases",  demo_filename[2]);
const CSVTransactionsJournalPath = path.join( __root, "databases",  demo_filename[3]);
const CSVTransactionsLedgerPath = path.join( __root, "databases",  demo_filename[4]);

const rowMapperCurrencyAndAccountType = (row) => ({
    "id": row.id, 
    "description": row.description
});

const rowMapperAccount = (row) => ({
    "name": row.name,
    "account_type": row.account_type,
    "description": row.description,
    "opening_balance": row.opening_balance,
    "currency": row.currency,
    "parent_id": row.parent_id,
    "created_at": row.created_at,
});

const rowMapperTransactionsJournal = (row) => ({
    "id": row.id,
    "description": row.description,
    "metadata": row.metadata,
    "created_at": row.created_at,
    "is_deleted": row.is_deleted
});

const rowMapperTransactionsLedger = (row) => ({
    "id": row.id,
    "transaction_id": row.transaction_id,
    "date_of_transaction": row.date_of_transaction,
    "account_id": row.account_id,
    "amount": row.amount,
    "currency": row.currency,
    "is_credit": row.is_credit,
    "is_foreign": row.is_foreign,
    "exchange_rate": row.exchange_rate
});

// init a wraper function for batch insert
let insertMany = db.transaction ( (rows, stmt) => {
    for ( const row of rows ) 
        stmt.run(row);
});

function importCSV ( CSVFilePath, tableName, insertSQL, rowMapper) {
        const dataBuffer = [];
        
        if ( ! fs.existsSync( CSVFilePath ) ) {
            console.log('error: csv File does not exists');
            process.exit(-1);
        }
        console.log( `status: csv file path: ${CSVFilePath}` )

        const methodToInput = demo_table_name.indexOf(tableName);

        fs.createReadStream( CSVFilePath )
            .pipe(csv())
            .on('data', (row) => {
                // row is an object where keys are the record
                const isRowValid = Object.values(row).every(value => value !== undefined);

                if ( !isRowValid ) {
                    // console.warn('row with undefined data:', row);
                    throw ValidationError( "row with undefined data", -1 );
                }
                // data pass undefined test
                dataBuffer.push(rowMapper(row));
            })
            .on('end', () => {
                try {
                    console.log( `csv data sample : \n${dataBuffer.slice(0,3)} `);
                    insertMany(dataBuffer, insertSQL);
                    // console.log(`csv to db completed`)
                    console.log(`status: CSV file imported for table ${tableName} has successfully processed. Total rows: ${dataBuffer.length}`);
                } catch (error) {
                    console.error('error: Database insertion failed::', error);
                }
            });
};

// ##################################################

if ( ! flag_view_only ) {
    try {
        if (flag_run_craete_all_table || isInsertCurrency) {
            console.log( `status: start run for table Currency` );
            importCSV(CSVCurrencyPath, demo_table_name[0], tableCurrencystmt, rowMapperCurrencyAndAccountType);
            console.log( `status: finish run for table Currency` );
        }
        if (flag_run_craete_all_table || isInsertAccountType) {
            console.log( `status: start run for table AccountType` );
            importCSV(CSVAccountTypePath, demo_table_name[1], tableAccountTypestmt, rowMapperCurrencyAndAccountType);
            console.log( `status: finish run for table AccountType` );
        }
        if (flag_run_craete_all_table || isInsertAccounts) {
            console.log( `status: start run for table Accounts` );
            importCSV(CSVAccountPath, demo_table_name[2], tableAccountstmt, rowMapperAccount);
            console.log( `status: finish run for table Accounts` );
        }
        if (flag_run_craete_all_table || isInsertTransactionsJournal) {
            console.log( `status: start run for table TransactionsJournal` );
            importCSV(CSVTransactionsJournalPath, demo_table_name[3], tableTransactionsJournalstmt, rowMapperTransactionsJournal);
            console.log( `status: finish run for table TransactionsJournal` );
        }
        if (flag_run_craete_all_table || isInsertTransactionsLedger) {
            console.log( `status: start run for table TransactionsLedger` );
            importCSV(CSVTransactionsLedgerPath, demo_table_name[4], tableTransactionsLedgerstmt, rowMapperTransactionsLedger);
            console.log( `status: finish run for table TransactionsLedger` );
        }
        // if (flag_run_craete_all_table || isInsertAccountBalance) {
        //     console.log( `status: start run for table TransactionsLedger` );
        //     importCSV(CSVTransactionsLedgerPath, demo_table_name[5], tableTransactionsLedgerstmt, rowMapperTransactionsLedger);
        //     console.log( `status: finish run for table TransactionsLedger` );
        // }
    }
    catch (e) {
        console.log( `insertion error: ${e}` );
    }
} // end if ( ! flag_view_only )

// ##################################################

console.log('script import finish');
// i guess like memory allocaiton you need manually "delete" it
// db.close();
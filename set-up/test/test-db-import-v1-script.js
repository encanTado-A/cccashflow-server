// necessary library
const path = require('node:path');
const Database = require('better-sqlite3');
const fs = require('fs');
const url = require('node:url');
const csv = require('csv-parser');
const env = require('dotenv');

const __root = path.join(__dirname, "../../..");
console.log( `you are at: ${__root}` );
env.config( {path: path.resolve(__root, './cccashflow-server', './.env') } );
// require env setting
// TEST_DATABASE_FILENAME
// TEST_CURRENCY_CSV,
// TEST_ACCOUNTTYPE_CSV,
// TEST_ACCOUNTS_CSV,
// TEST_TRANSACTIONSJOURNAL_CSV,
// TEST_TRANSACTIONSLEDGER_CSV,
// TEST_USERS_CSV


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
    console.log( `--view / -l \t\t : program will NOT run any creation` );
    console.log( `--verbose / -v \t\t : program database will verbose` );
    console.log( `-TC \t\t\t : insert for table Currency` );
    console.log( `-TAT \t\t\t : insert for table AccountType` );
    console.log( `-TA \t\t\t : insert for table Accounts` );
    console.log( `-TJ \t\t\t : insert for table TransactionsJournal` );
    console.log( `-TL \t\t\t : insert for table TransactionsLedger` );
    console.log( `-AB \t\t\t : insert for table AccountBalance [not ready]` );
    console.log( `-TU \t\t\t : insert for table Users` );
    
    process.exit(0);
}

const flag_run_craete_all_table = args.includes('--all') || args.includes('-a');
const flag_view_only = (! flag_run_craete_all_table) && (args.includes('--view') || args.includes('-l'));
if ( flag_view_only ) {
    console.log("no insertion would be made");
}

const isVerbose = ( args.includes('-verbose') || args.includes('-v') ) ?? 0;
const isInsertCurrency = args.includes('-TC') ?? 0;
const isInsertAccountType = args.includes('-TAT') ?? 0;
const isInsertAccounts = args.includes('-TA') ?? 0;
const isInsertTransactionsJournal = args.includes('-TJ') ?? 0;
const isInsertTransactionsLedger = args.includes('-TL') ?? 0;
const isInsertAccountBalance = args.includes('-AB') ?? 0;
const isInsertUsers = args.includes('-TU') ?? 0;


// ##################################################

// __filename __dirname given in cjs

// ##################################################
// path and filename definition

const database_name = process.env.TEST_DATABASE_FILENAME;

const filename = [
    process.env.TEST_CURRENCY_CSV,
    process.env.TEST_ACCOUNTTYPE_CSV,
    process.env.TEST_ACCOUNTS_CSV,
    process.env.TEST_TRANSACTIONSJOURNAL_CSV,
    process.env.TEST_TRANSACTIONSLEDGER_CSV,
    process.env.TEST_ACCOUNTBALANCE_CSV,
    process.env.TEST_USERS_CSV,
];


const table_name = [
    `Currency`,
    `AccountType`,
    `Accounts`,
    `TransactionJournal`,
    `TransactionLedger`,
    `AccountBalance`,
    `Users`,
];

const db_file_path = path.join(__root, "databases", database_name);
if (! fs.existsSync( db_file_path )) {
    console.log( `database file ${database_name} does not exists` );
    process.exit(-1);
}

if ( flag_view_only ) {
    console.log( "table can be imported: " );
    for (let i = 0; i < table_name.length; i++) {
        console.log(`\t\t${ table_name[i] }`);
    };
    process.exit(0);
}

// ##################################################
// check db exist

let db = null;
try {
    if ( isVerbose ) {
        db = new Database(db_file_path, { verbose: console.log });
    }
    else {
        db = new Database(db_file_path);
    }
    if ( db && db.open) {
        console.log('db open');
    }
}
catch (e) {
    console.log(`db open error: ${e}`);
    process.exit(-1);
}

console.log( "\ntable to be imported: " );
if ( flag_run_craete_all_table ) {
    for (let i = 0; i < table_name.length; i++) {
        console.log(`\t\t${ table_name[i] }`);
    };
}
else {
    if (isInsertCurrency) console.log(`\t\t${ table_name[0] }`);
    if (isInsertAccountType) console.log(`\t\t${ table_name[1] }`);
    if (isInsertAccounts) console.log(`\t\t${ table_name[2] }`);
    if (isInsertTransactionsJournal) console.log(`\t\t${ table_name[3] }`);
    if (isInsertTransactionsLedger) console.log(`\t\t${ table_name[4] }`);
    if (isInsertAccountBalance) console.log(`\t\t${ table_name[5] }`);
    // if (isInsertUsers) console.log(`\t\t${ table_name[6] }`);
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
let tableAccountBalancestmt = db.prepare(`INSERT INTO AccountBalance 
    (id, account_id, balance, currency, updated_at) 
    VALUES (@id, @account_id, @balance, @currency, @updated_at)`);
let tableUsersstmt = db.prepare(`INSERT INTO Users 
    (username, email, password) 
    VALUES (@username, @email, @password)`);

const CSVCurrencyPath = path.join( __root, "databases",  filename[0]);
const CSVAccountTypePath = path.join( __root, "databases",  filename[1]);
const CSVAccountPath = path.join( __root, "databases",  filename[2]);
const CSVTransactionsJournalPath = path.join( __root, "databases",  filename[3]);
const CSVTransactionsLedgerPath = path.join( __root, "databases",  filename[4]);
const CSVAccountBalancePath = path.join( __root, "databases",  filename[5]);
const CSVUsersPath = path.join(__root, "databases", filename[6]);

// helper function from AI for checking JSON
function validJsonOrNull(value) {
    if (!value || value.trim() === '') 
        // return null;
        return JSON.stringify({});
    try {
        JSON.parse(value);
        return value;
    } catch {
        throw new ValidationError(`invalid JSON metadata: ${value}`);
    }
}

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
    "metadata": validJsonOrNull(row.metadata),
    "created_at": row.created_at,
    "is_deleted": row.is_deleted ?? 0
});

const rowMapperTransactionsLedger = (row) => ({
    "id": row.id,
    "transaction_id": row.transaction_id,
    "date_of_transaction": row.date_of_transaction,
    "account_id": row.account_id,
    "amount": row.amount,
    "currency": row.currency,
    "is_credit": row.is_credit,
    "is_foreign": row.is_foreign ?? 0,
    "exchange_rate": row.exchange_rate ?? null
});

const rowMapperAccountBalance = (row) => ({
    "id": row.id,
    "account_id": row.account_id,
    "balance": (row.balance < 0 || row.balance == null ) ? 0 : row.balance,
    "currency": row.currency ?? 'HKD',
    "updated_at": row.updated_at
});

const rowMapperUsers = (row) => ({
    "username": row.username,
    "email": row.email ?? "",
    "password": row.password
});

// init a wraper function for batch insert
let insertMany = db.transaction ( (rows, stmt) => {
    for ( const row of rows ) 
        stmt.run(row);
});


function logImportResult(tableName, status, details = '') {
    importResults.push({ tableName, status, details });
    
    if (status === 'success') {
        console.log(`status: success for table ${tableName} - ${details}`);
    } else {
        console.error(`status: failed for table ${tableName} - ${details}`);
    }
}

async function importCSV ( CSVFilePath, tableName, insertSQL, rowMapper) {
    return new Promise((resolve, reject) => {
        const dataBuffer = [];
        
        if ( ! fs.existsSync( CSVFilePath ) ) {
            console.log('error: csv File does not exists');
            process.exit(-1);
        }
        console.log( `status: csv file path: ${CSVFilePath}` )

        // const methodToInput = table_name.indexOf(tableName);

        const stream = fs.createReadStream( CSVFilePath ).pipe(csv());

        stream.on('data', (row) => {
            try {
                // row is an object where keys are the record
                const isRowValid = Object.values(row).every(value => value !== undefined);
    
                if ( !isRowValid ) {
                    // console.warn('row with undefined data:', row);
                    throw ValidationError( "row with undefined data", -1 );
                }
                // data pass undefined test
                dataBuffer.push(rowMapper(row));
            }
            catch (error) {
                stream.destroy(error);
            }
        });

        stream.on('error', (error) => {
            logImportResult(tableName, 'failed', error.message);
            reject(error);
        });

        stream.on('end', () => {
            try {
                console.log( `csv data sample : \n${ JSON.stringify( dataBuffer.slice(-3), null, 2 ) } `);
                insertMany(dataBuffer, insertSQL);
                logImportResult(tableName, 'success', `processed ${dataBuffer.length} rows`);
                resolve({ tableName, rows: dataBuffer.length, status: 'success' });
            } catch (error) {
                logImportResult(tableName, 'failed', error.message);
                reject(error);
            }
        });
    });
}; // end async importCSV ()

// ##################################################

async function runImports() {
    if ( ! flag_view_only ) {
        try {
            if (flag_run_craete_all_table || isInsertCurrency) {
                console.log( `status: start run for table Currency` );
                await importCSV(CSVCurrencyPath, table_name[0], tableCurrencystmt, rowMapperCurrencyAndAccountType);
            }
            if (flag_run_craete_all_table || isInsertAccountType) {
                console.log( `status: start run for table AccountType` );
                await importCSV(CSVAccountTypePath, table_name[1], tableAccountTypestmt, rowMapperCurrencyAndAccountType);
            }
            if (flag_run_craete_all_table || isInsertAccounts) {
                console.log( `status: start run for table Accounts` );
                await importCSV(CSVAccountPath, table_name[2], tableAccountstmt, rowMapperAccount);
            }
            if (flag_run_craete_all_table || isInsertTransactionsJournal) {
                console.log( `status: start run for table TransactionsJournal` );
                await importCSV(CSVTransactionsJournalPath, table_name[3], tableTransactionsJournalstmt, rowMapperTransactionsJournal);
            }
            if (flag_run_craete_all_table || isInsertTransactionsLedger) {
                console.log( `status: start run for table TransactionsLedger` );
                await importCSV(CSVTransactionsLedgerPath, table_name[4], tableTransactionsLedgerstmt, rowMapperTransactionsLedger);
            }
            if (flag_run_craete_all_table || isInsertAccountBalance) {
                console.log( `status: start run for table TransactionsLedger` );
                await importCSV(CSVAccountBalancePath, table_name[5], tableAccountBalancestmt, rowMapperAccountBalance);
            }
            if (flag_run_craete_all_table || isInsertUsers) {
                console.log( `status: start run for table TransactionsLedger` );
                await importCSV(CSVUsersPath, table_name[5], tableUsersstmt, rowMapperUsers);
            }
        }
        catch (e) {
            console.log( `insertion error: ${e}` );
        }
    } // end if ( ! flag_view_only )

    console.log('import summary:');
    for (const entry of importResults) {
        console.log(`- ${entry.tableName}: ${entry.status} - ${entry.details}`);
    }
}

// ##################################################
const importResults = [];

runImports().catch((error) => {
    console.error('script import failed:', error);
});

console.log('script import finish');
// i guess like memory allocaiton you need manually "delete" it
// db.close();
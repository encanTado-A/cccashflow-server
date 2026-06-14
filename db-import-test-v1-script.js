// necessary library
const path = require('node:path');
const Database = require('better-sqlite3');
const fs = require('fs');
const url = require('node:url');
const csv = require('csv-parser');

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

const args = process.argv;
let flag_run_craete_table = false;

const isInsert = args.includes('--insert') || args.includes('-i');

if (isInsert) {
    flag_run_craete_table = 1;
}
else {
    console.log("no insertion would be made");
}

console.log(__filename);
console.log(__dirname);
const __root = path.join(__dirname, "..");

// const __filename = url.fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// check db exist
const demo_database_name = `test-06-14-v1.db`;

const demo_filename = [
    `currency.csv`,
    `account-type.csv`,
    `demo-accounts-v3.1.csv`,
    `test-1-data-23-26_ccc_tj.csv`,
    `test-1-data-23-26-ccc-tl.csv`,
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

console.log( "table to be created: " );
for (let i = 0; i < demo_table_name.length; i++) {
    console.log(`\t\t${ demo_table_name[i] }`);
};

// init tables
// call db-setpup script

// ##################################################
// read csv data and insert into db

// smarter approach
// let tableCurrency = db.prepare(`INSERT INTO Currency (id, description) VALUES (@id, @description)`);
// let tableAccountType = db.prepare(`INSERT INTO AccountType (id, description) VALUES (@id, @description)`);
// let tableAccount = db.prepare(`INSERT INTO Account 
//         (name, account_type, description, opening_balance, currency, parent_id, created_at) 
//         VALUES (@name, @account_type, @description, @opening_balance, @currency, @parent_id, @created_at)`);
// let tableTransactionJournal = db.prepare(`INSERT INTO TransactionJournal 
//     (id, description, metadata, created_at, is_deleted) 
//     VALUES (@id, @description, @metadata, @created_at, @is_deleted)`);
// let tableTransactionLedger = db.prepare(`INSERT INTO TransactionLedger 
//     (id, description, metadata, created_at, is_deleted) 
//     VALUES (@id, @description, @metadata, @created_at, @is_deleted)`);

// // init a wraper for batch insert
// let insertMany = db.transaction ( (rows, stmt) => {
//     for ( const row of rows ) stmt.run(row);
// });

// function importCSV (filePath, tableName, insertSQL, rowMapper) {
//         const dataBuffer = [];
    
//         let csv_file_path = path.join( __root, "databases", demo_filename[i] )
    
//         if ( ! fs.existsSync( csv_file_path ) ) {
//             console.log('csv File does not exists');
//             process.exit(-1);
//         }
//         console.log(csv_file_path)
        
//         fs.createReadStream( csv_file_path )
//             .pipe(csv())
//             .on('data', (row) => {
//                 // row is an object where keys are the record
//                 if (row.id !== undefined && row.description !== undefined) {
//                     dataBuffer.push({
//                         id: row.id, 
//                         description: row.description
//                     });
//                 }
//             })
//             .on('end', () => {
//                 try {
//                     console.log(dataBuffer);
//                     insertMany(dataBuffer);
//                     // console.log(`csv to db completed`)
//                     console.log(`CSV file for ${demo_filename[i]} has successfully processed. Total rows: ${dataBuffer.length}`);
//                 } catch (error) {
//                     console.error('Database insertion failed:', error);
//                 }
//             });
// };

if ( flag_run_craete_table ) {
    // for table: Currency, AccountType
    for (let i = 0; i < 2; i++) {
        // ready the sql
        let stmt = db.prepare(`INSERT INTO ${demo_table_name[i]} (id, description) VALUES (@id, @description)`);
        
        // init a wraper for batch insert
        let insertMany = db.transaction ( (rows) => {
            for ( const row of rows ) stmt.run(row);
        });
        
        const dataBuffer = [];
    
        let csv_file_path = path.join( __root, "databases", demo_filename[i] )
    
        if ( ! fs.existsSync( csv_file_path ) ) {
            console.log('csv File does not exists');
            process.exit(-1);
        }
        console.log(csv_file_path)
        
        fs.createReadStream( csv_file_path )
            .pipe(csv())
            .on('data', (row) => {
                // row is an object where keys are the record
                if (row.id !== undefined && row.description !== undefined) {
                    dataBuffer.push({
                        id: row.id, 
                        description: row.description
                    });
                }
            })
            .on('end', () => {
                try {
                    console.log(dataBuffer);
                    insertMany(dataBuffer);
                    // console.log(`csv to db completed`)
                    console.log(`CSV file for ${demo_filename[i]} has successfully processed. Total rows: ${dataBuffer.length}`);
                } catch (error) {
                    console.error('Database insertion failed:', error);
                }
            });
    } // end i loop
    
    // ==================================================
    // reminaing table: Accounts, TransactionJournal, TransactionLedger, AccountBalance
    // Account
    let table_counter = 2;
    let targetTableName = demo_table_name[table_counter];
    
    // ready the sql
    let stmt = db.prepare(`INSERT INTO ${demo_table_name[table_counter]} 
        (name, account_type, description, opening_balance, currency, parent_id, created_at) 
        VALUES (@name, @account_type, @description, @opening_balance, @currency, @parent_id, @created_at)`);
    
    // init a wraper for batch insert: we just use the one
    let insertMany = db.transaction ( (rows) => {
        for ( const row of rows ) stmt.run(row);
    });
        
    dataBuffer = [];

    let csv_file_path = path.join( __root, "databases", demo_filename[table_counter] );

    if ( ! fs.existsSync( csv_file_path ) ) {
        console.log(`csv file in ${csv_file_path} does not exists`);
        process.exit(-1);
    }
    console.log(`csv file found for ${csv_file_path}`);
    
    fs.createReadStream( csv_file_path )
        .pipe(csv())
        .on('data', (row) => {
            // row is an object where keys are the record
            if ( (row.id !== undefined && row.account_type !== undefined) &&
                (row.created_at !== undefined) ) {
                dataBuffer.push({
                    "name": row.name,
                    "account_type": row.account_type,
                    "description": row.description,
                    "opening_balance": row.opening_balance,
                    "currency": row.currency,
                    "parent_id": row.parent_id,
                    "created_at": row.created_at,
                });
            }
        })
        .on('end', () => {
            try {
                console.log(dataBuffer);
                insertMany(dataBuffer);
                // console.log(`csv to db completed`)
                console.log(`CSV file for ${demo_filename[table_counter]} has successfully processed. Total rows: ${dataBuffer.length}`);
            } catch (error) {
                console.error('Database insertion failed:', error);
            }
        });

    // --------------------------------------------------
    // TransactionJournal
    table_counter = 3;
    let targetTableName = demo_table_name[table_counter];
    
    // ready the sql
    let stmt = db.prepare(`INSERT INTO ${demo_table_name[table_counter]} 
        (id, description, metadata, created_at, is_deleted) 
        VALUES (@id, @description, @metadata, @created_at, @is_deleted)`);
    
    // init a wraper for batch insert: we just use the one
    let insertMany = db.transaction ( (rows) => {
        for ( const row of rows ) stmt.run(row);
    });
        
    dataBuffer = [];

    let csv_file_path = path.join( __root, "databases", demo_filename[table_counter] );

    if ( ! fs.existsSync( csv_file_path ) ) {
        console.log(`csv file in ${csv_file_path} does not exists`);
        process.exit(-1);
    }
    console.log(`csv file found for ${csv_file_path}`);
    
    fs.createReadStream( csv_file_path )
        .pipe(csv())
        .on('data', (row) => {
            // row is an object where keys are the record
            if ( (row.id !== undefined && row.account_type !== undefined) &&
                (row.created_at !== undefined) ) {
                dataBuffer.push({
                    "name": row.name,
                    "description": row.description,
                    "metadata": row.metadata,
                    "created_at": row.created_at,
                    "is_deleted": row.is_deleted
                });
            }
        })
        .on('end', () => {
            try {
                console.log(dataBuffer);
                insertMany(dataBuffer);
                // console.log(`csv to db completed`)
                console.log(`CSV file for ${demo_filename[table_counter]} has successfully processed. Total rows: ${dataBuffer.length}`);
            } catch (error) {
                console.error('Database insertion failed:', error);
            }
        });
    // --------------------------------------------------
    // TransactionLedger
    table_counter = 4;
    let targetTableName = demo_table_name[table_counter];
    
    // ready the sql
    let stmt = db.prepare(`INSERT INTO ${demo_table_name[table_counter]} 
        (id, transaction_id, date_of_transaction, account_id, amount, is_credit, currency, is_foreign, exchange_rate) 
        VALUES (@id, @transaction_id, @date_of_transaction, @account_id, @amount, @is_credit, @currency, @is_foreign, @exchange_rate)`);
    
    // init a wraper for batch insert: we just use the one
    let insertMany = db.transaction ( (rows) => {
        for ( const row of rows ) stmt.run(row);
    });
        
    dataBuffer = [];

    let csv_file_path = path.join( __root, "databases", demo_filename[table_counter] );

    if ( ! fs.existsSync( csv_file_path ) ) {
        console.log(`csv file in ${csv_file_path} does not exists`);
        process.exit(-1);
    }
    console.log(`csv file found for ${csv_file_path}`);
    
    fs.createReadStream( csv_file_path )
        .pipe(csv())
        .on('data', (row) => {
            // row is an object where keys are the record
            if ( (row.id !== undefined && row.account_type !== undefined) &&
                (row.created_at !== undefined) ) {
                dataBuffer.push({
                    "id": row.id,
                    "transaction_id": row.transaction_id,
                    "date_of_transaction": row.date_of_transaction,
                    "account_id": row.account_id,
                    "amount": row.amount,
                    "is_credit": row.is_credit,
                    "is_foreign": row.is_foreign,
                    "exchange_rate": row.exchange_rate
                });
            }
        })
        .on('end', () => {
            try {
                console.log(dataBuffer);
                insertMany(dataBuffer);
                // console.log(`csv to db completed`)
                console.log(`CSV file for ${demo_filename[table_counter]} has successfully processed. Total rows: ${dataBuffer.length}`);
            } catch (error) {
                console.error('Database insertion failed:', error);
            }
        });

    // --------------------------------------------------
} // end if ( flag_run_craete_table )

console.log('script import finish');
// i guess like memory allocaiton you need manually "delete" it
// db.close();
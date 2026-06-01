// necessary library
// import Database from 'better-sqlite3';
// import fs from 'fs';
// import csv from 'csv-parser';

// Cjs
const Database = require('better-sqlite3');
const fs = require('fs');
const csv = require('csv-parser');

const results = [];
// ##################################################

// const HOSTNAME = '127.0.0.1';
// // const PORT = 8000;

// // read a csv
// fs.createReadStream('../databases/demo-accounts.csv')
//     .pi`pe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', () => {
//       console.log(results);
//     });`

// ##################################################

// // check csv exist
// if ( process.argv.length != 4) {
//     console.log('not enough arguement');
//     console.log(`USAGE: node <script> <database_filename> <csv_filename>`)
//     process.exit()
// }
// console.log(`target table: ${process.argv[2]}, target location: ${process.argv[3]}`);

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

const db_file_path = post_path+demo_filename[0];
if (! fs.existsSync( db_file_path )) {
    console.log('File does not exists');
    process.exit()
}

const db = new Database(db_file_path, { verbose: console.log, fileMustExist: true});
if ( db && db.open) {
    console.log('db open');
}
// const Database = require('better-sqlite3')(db_file_path, { verbose: console.log });

for (let i = 0; i < demo_filename.length; i++) {
    console.log(`${i}th filename:\t\t${ post_path+demo_filename[i] }`)
};

// ##################################################
// read csv data and insert into db

// for table: Currency

// let stmt = db.prepare(`INSERT INTO ${demo_table_name[0]} VALUES (?, ?)`);
let stmt = db.prepare(`INSERT INTO ${demo_table_name[0]} (id, description) VALUES (@id, @description)`);

const insertMany = db.transaction ( (rows) => {
    for ( const row of rows ) stmt.run(row);
});

const dataBuffer = [];

if (! fs.existsSync( post_path+demo_filename[3] )) {
    console.log('csv File does not exists');
    process.exit()
}
console.log(post_path+demo_filename[3])

fs.createReadStream( post_path+demo_filename[3] )
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
            console.log(`CSV file for ${demo_filename[3]} has successfully processed. Total rows: ${dataBuffer.length}`);
        } catch (error) {
            console.error('Database insertion failed:', error);
        }
    });


// db.serialize(() => {
//     console.log('stamp 1');
//     const stmt = db.prepare(`INSERT INTO ${demo_table_name[0]} VALUES (?, ?)`);

//     // read the csv
//     console.log('stamp 2');
//     fs.createReadStream(post_path+demo_filename[3])
//         .pipe(csv())
//         .on('data', (row) => {
//             // row is an object where keys are the record
//             stmt.run( row.id, 
//                         row.description);
//         })
//         .on('end', () => {
//                 stmt.finalize();
//                 console.log(`CSV file for ${demo_filename[3]} has successfully processed`);
//             });
//     console.log('stamp 3');
// }); // end db.serialize()

// ==================================================

// // for table: MoneyCurrency
// db.serialize(() => {
//     const stmt = db.prepare(`INSERT INTO ${process.argv[2]} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

//     // read the csv
//     fs.createReadStream(process.argv[3])
//     .pipe(csv())
//     .on('data', (row) => {
//         // row is an object where keys are your CSV headers
//         stmt.run( row.id, 
//                     row.name, 
//                     row.account_type, 
//                     row.description, 
//                     row.opening_balance, 
//                     row.currency, 
//                     row.money_category, 
//                     row.created_at, 
//                     row.updated_at );
//     })
//     .on('end', () => {
//             stmt.finalize();
//             console.log(`CSV file for ${process.argv[3]} has successfully processed`);
//         });
// }); // end db.serialize()


// // for table: Accounts
// db.serialize(() => {
//     const stmt = db.prepare(`INSERT INTO ${process.argv[2]} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

//     // read the csv
//     fs.createReadStream(process.argv[3])
//     .pipe(csv())
//     .on('data', (row) => {
//         // row is an object where keys are your CSV headers
//         stmt.run( row.id, 
//                   row.name, 
//                   row.account_type, 
//                   row.description, 
//                   row.opening_balance, 
//                   row.currency, 
//                   row.money_category, 
//                   row.created_at, 
//                   row.updated_at );
//     })
//     .on('end', () => {
//         stmt.finalize();
//         console.log(`CSV file for ${process.argv[3]} has successfully processed`);
//     });
// }); // end db.serialize()

            
// i guess like memory allocaiton you need manually "delete" it
// db.close();
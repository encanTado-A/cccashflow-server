// necessary library
import Database from 'better-sqlite3';
import fs from 'fs';
import csv from 'csv-parser';
const results = [];

// const HOSTNAME = '127.0.0.1';
// // const PORT = 8000;

// // read a csv
// fs.createReadStream('../databases/demo-accounts.csv')
//     .pi`pe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', () => {
//       console.log(results);
//     });`

// check csv exist
if ( process.argv.length != 4) {
    console.log('not enough arguement');
    console.log(`USAGE: node <script> <database_filename> <csv_filename>`)
    process.exit()
}
console.log(`target table: ${process.argv[2]}, target location: ${process.argv[3]}`);

// check db exist
const db_file_path = "F:\\devp\\cccashflow\\databases\\demo.db";
if (! fs.existsSync('F:\\devp\\cccashflow\\databases\\demo.db')) {
    console.log('File does not exists');
    process.exit()
}

const db = new Database('demo.db', { verbose: console.log });


// read csv data and insert into db

// for table: Accounts
db.serialize(() => {
    const stmt = db.prepare(`INSERT INTO ${process.argv[2]} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    // read the csv
    fs.createReadStream(process.argv[3])
    .pipe(csv())
    .on('data', (row) => {
        // row is an object where keys are your CSV headers
        stmt.run( row.id, 
                  row.name, 
                  row.account_type, 
                  row.description, 
                  row.opening_balance, 
                  row.currency, 
                  row.money_category, 
                  row.created_at, 
                  row.updated_at );
    })
    .on('end', () => {
        stmt.finalize();
        console.log(`CSV file for ${process.argv[3]} has successfully processed`);
    });
}); // end db.serialize()

// // for table: Currency
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
db.close();
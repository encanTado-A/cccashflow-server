// necessary library
import sqlite3 from 'sqlite3';
import fs from 'fs';
import csv from 'csv-parser';
const results = [];
// import env from 'dotenv';
// env.config();

// const HOSTNAME = '127.0.0.1';
// // const PORT = 8000;

// // read a csv
// fs.createReadStream('../databases/demo-accounts.csv')
//     .pi`pe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', () => {
//       console.log(results);
//     });`

// check db exist
if (! fs.existsSync('F:\\devp\\cccashflow\\databases\\demo.db')) {
    console.log('File does not exists');
    process.exit()
}

const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
});

// check csv exist
if ( process.argv.length != 4) {
    console.log('not enough arguement');
    process.exit()
}

console.log(`target table: ${process.argv[2]}, target location: ${process.argv[3]}`);
// read data

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

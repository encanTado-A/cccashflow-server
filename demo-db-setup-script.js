// necessary library
const path = require('node:path');
const Database = require('better-sqlite3');
const fs = require('fs');
const csv = require('csv-parser');

// ##################################################

// // read a csv
// const results = [];
// fs.createReadStream('../databases/demo-accounts.csv')
//     .pi`pe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', () => {
//       console.log(results);
//     });`

// ##################################################

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// check db exist
const demo_filename = [
    `demo.db`,
    `demo-currency.csv`,
    `demo-account-type.csv`,
    `demo-money-category.csv`,
    `demo-accounts.csv`,
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

const db_file_path = path.join(__dirname, "databases", demo_filename[0]);
if (! fs.existsSync( db_file_path )) {
    console.log('File does not exists');
    process.exit()
}

const db = new Database(db_file_path, { verbose: console.log });
if ( db && db.open) {
    console.log('db open');
}
// const Database = require('better-sqlite3')(db_file_path, { verbose: console.log });

for (let i = 0; i < demo_filename.length; i++) {
    console.log(`${i}th filename:\t\t${ demo_filename[i] }`)
};

// init tables
async function setupDatabase(db) {
    // Open/Create the database file

    const tableAccountType = db.prepare( "CREATE TABLE IF NOT EXISTS AccountType (id INTEGER PRIMARY KEY , description VARCHAR(16))" );
    const tableCurrency = db.prepare( "CREATE TABLE IF NOT EXISTS Currency (id CHAR(3) NOT NULL PRIMARY KEY, description VARCHAR(64))" );
    const tableMoneyCategory = db.prepare( "CREATE TABLE IF NOT EXISTS MoneyCategory (id INTEGER PRIMARY KEY, description VARCHAR(64))" );
    const tableAccounts = db.prepare( `CREATE TABLE IF NOT EXISTS Accounts (
                id INTEGER PRIMARY KEY,
                name VARCHAR(64) NOT NULL,
                account_type INT NOT NULL,
                description TEXT,
                opening_balance DECIMAL(15, 2) DEFAULT 0,
                currency CHAR(3) NOT NULL, 
                money_category INT NOT NULL, 
                created_at DATE NOT NULL,

                FOREIGN KEY (account_type) REFERENCES AccountType(id),
                FOREIGN KEY (currency) REFERENCES Currency(id),
                FOREIGN KEY (money_category) REFERENCES MoneyCategory(id)
                )` );

    await db.exec(tableAccountType);
    await db.exec(tableCurrency);
    await db.exec(tableMoneyCategory);
    await db.exec(tableAccounts);
};

setupDatabase(db).then( () => {
    console.log('db setup completed');
    const stmt = db.prepare("SELECT sql FROM sqlite_schema WHERE type IN ('table', 'index') AND sql NOT NULL;");
    stmt.exec(".schema");
});

// ##################################################
// read csv data and insert into db

// for table: Currency, AccountType, MoneyCategory
for (let i = 0; i < 3; i++) {
    // ready the sql
    let stmt = db.prepare(`INSERT INTO ${demo_table_name[i]} (id, description) VALUES (@id, @description)`);
    
    // init a wraper for batch insert
    let insertMany = db.transaction ( (rows) => {
        for ( const row of rows ) stmt.run(row);
    });
    
    const dataBuffer = [];

    let csv_file_path = path.join( __dirname, "databases", demo_filename[i+1] )

    if ( ! fs.existsSync( csv_file_path ) ) {
        console.log('csv File does not exists');
        process.exit(-1)
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
                console.log(`CSV file for ${demo_filename[i+1]} has successfully processed. Total rows: ${dataBuffer.length}`);
            } catch (error) {
                console.error('Database insertion failed:', error);
            }
        });
} // end i loop

// ==================================================
// reminaing table: Accounts, AccountBalance, TransactionJournal, TransactionLedger


// i guess like memory allocaiton you need manually "delete" it
// db.close();
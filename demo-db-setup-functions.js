import sqlite3 from 'sqlite3';
import fs from 'fs';
import csv from 'csv-parser';
import readline from 'readline';

let filename = readline();

if (! fs.existsSync('F:\\devp\\cccashflow\\databases\demo.db')) {
    console.log('File does not exists');
    return -1;
}

// read data
for (let i = 2; i < process.argv.length; i++) {
    console.log(`process.argv[${i}]: ${process.argv[i]}`);
    let fileLocation = `F:\\devp\\cccashflow\\databases\\${process.argv[i]}`;
    
    if ( ! fs.existsSync(fileLocation) ) {
        console.log(`File ${process.argv[i]} does not exists`);
        return -1;
    }

    fs.createReadStream(fileLocation)
        .pipe(csv())
        .on('data', (row) => {
        // row is an object where keys are your CSV headers
        stmt.run(row.id, row.name, row.email);
        })
        .on('end', () => {
        stmt.finalize();
        console.log('CSV file successfully processed');
        });

};





// tmp

// ######################## async way ########################
// >> sqlite Wrapper <<
export async function setupDatabase() {
    // Open/Create the database file
    const db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    const tableAccountType = db.prepare("CREATE TABLE IF NOT EXISTS AccountType (id INT PRIMARY KEY, description VARCHAR(100))");
    const tableCurrency = db.prepare("CREATE TABLE IF NOT EXISTS Currency (id CHAR(3) PRIMARY KEY, description VARCHAR(30))");
    const tableMoneyCategory = db.prepare("CREATE TABLE IF NOT EXISTS MoneyCategory (id INT PRIMARY KEY, description VARCHAR(100))");
    const tableAccounts = db.prepare(`CREATE TABLE IF NOT EXISTS Accounts (
                            id INT PRIMARY KEY, 
                            name VARCHAR(100) ,
                            account-type INT,
                            description TEXT,
                            opening-balance DECIMAL(15, 2) DEFAULT 0,
                            currency CHAR(3), 
                            money-category INT, 
                            created-at DATETIME,
                            updated-at DATETIME,
                            FOREIGN KEY (account-type) REFERENCE AccountType,
                            FOREIGN KEY (currency) REFERENCE Currency,
                            FOREIGN KEY (money-category) REFERENCE MoneyCategory,)
                            `);

    await db.exec(tableAccountType);
    await db.exec(tableCurrency);
    await db.exec(tableMoneyCategory);
    await db.exec(tableAccounts);
};


export async function import_from_csv (database, data) {
    // if
    db.serialize(() => {
    const stmt = db.prepare("INSERT INTO users VALUES (?, ?, ?)");

    // read the csv
    fs.createReadStream('data.csv')
        .pipe(csv())
        .on('data', (row) => {
        // row is an object where keys are your CSV headers
        stmt.run(row.id, row.name, row.email);
        })
        .on('end', () => {
        stmt.finalize();
        console.log('CSV file successfully processed');
        });
    });
};



// ######################## callback way ########################
const db = new sqlite3.Database('demo.db', sqlite3.OPEN_READWRITE);

// init tables
try {
  db.serialize(() => {
      const tableAccountType = db.prepare("CREATE TABLE IF NOT EXISTS AccountType (id INT PRIMARY KEY, description VARCHAR(100)");
      const tableCurrency = db.prepare("CREATE TABLE IF NOT EXISTS Currency (id CHAR(3) PRIMARY KEY, description VARCHAR(30))");
      const tableMoneyCategory = db.prepare("CREATE TABLE IF NOT EXISTS MoneyCategory (id INT PRIMARY KEY, description VARCHAR(100))");
      const tableAccounts = db.prepare(`CREATE TABLE IF NOT EXISTS Accounts (
                              id INT PRIMARY KEY, 
                              name VARCHAR(100) ,
                              account-type INT,
                              description TEXT,
                              opening-balance DECIMAL(15, 2) DEFAULT 0,
                              currency CHAR(3), 
                              money-category INT, 
                              created-at DATETIME,
                              updated-at DATETIME,
                              FOREIGN KEY (account-type) REFERENCE AccountType,
                              FOREIGN KEY (currency) REFERENCE Currency,
                              FOREIGN KEY (money-category) REFERENCE MoneyCategory,)
                              `);
  });
}
catch (error) {
  console.error("An error occurred:", error.message);
}

// from ai
// Start a transaction for better performance
db.serialize(() => {
  // db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, name TEXT, email TEXT)");
  const stmt = db.prepare("INSERT INTO users VALUES (?, ?, ?)");

  // read the csv
  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => {
      // row is an object where keys are your CSV headers
      stmt.run(row.id, row.name, row.email);
    })
    .on('end', () => {
      stmt.finalize();
      console.log('CSV file successfully processed');
    });
});


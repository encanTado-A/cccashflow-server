#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dotenv = require('dotenv');

dotenv.config( { path: path.join(__dirname, '.env') } );

const csvPath = process.env.JSON_CHECK_CSV?.trim();
const jsonColumn = process.env.JSON_CHECK_JSON_COLUMN?.trim();
const outputFile = process.env.JSON_CHECK_OUTPUT_FILE?.trim();

if (!csvPath || !jsonColumn) {
    console.error('Please fill JSON_CHECK_CSV and JSON_CHECK_JSON_COLUMN in the .env file.');
    process.exit(1);
}

const absoluteCsvPath = path.isAbsolute(csvPath)
    ? csvPath
    : path.join(__dirname, "..", "databases", csvPath);

if (!fs.existsSync(absoluteCsvPath)) {
    console.error(`CSV file not found: ${absoluteCsvPath}`);
    process.exit(1);
}

const parsedJsonRows = [];
let processedRows = 0;
let headersSeen = false;

const stream = fs.createReadStream(absoluteCsvPath).pipe(csv());

stream.on('headers', (headers) => {
    headersSeen = true;

    if (!headers.includes(jsonColumn)) {
        console.error(`Column "${jsonColumn}" was not found. Available columns: ${headers.join(', ')}`);
        process.exit(1);
    }
});

stream.on('data', (row) => {
    processedRows += 1;
    const lineNumber = processedRows + 1;
    const rawValue = row[jsonColumn];

    // check empty
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === '') {
        console.log( `[line ${lineNumber}] Empty JSON value in column "${jsonColumn}"` );
        console.log( `[line ${lineNumber}] skipping line ${lineNumber}` );
        // console.error(`[line ${lineNumber}] Empty JSON value in column "${jsonColumn}".`);
        // console.error(`Row data: ${JSON.stringify(row)}`);
        // process.exit(1);
    }
    else {
        try {
            const parsedValue = JSON.parse(String(rawValue).trim());
            parsedJsonRows.push({
            lineNumber,
            column: jsonColumn,
            data: parsedValue,
            raw: rawValue,
            });
        } catch (error) {
            console.error(`[line ${lineNumber}] Invalid JSON in column "${jsonColumn}".`);
            console.error(`Value: ${rawValue}`);
            console.error(`Details: ${error.message}`);
            process.exit(1);
        }
    }
});

stream.on('end', () => {
    if (!headersSeen) {
        console.error('No CSV headers were found.');
        process.exit(1);
    }

    console.log(`Finished processing ${processedRows} row(s).`);

    if (outputFile) {
        const absoluteOutputPath = path.isAbsolute(outputFile)
        ? outputFile
        : path.join(__dirname, outputFile);

        fs.writeFileSync(absoluteOutputPath, JSON.stringify(parsedJsonRows, null, 2));
        console.log(`Exported JSON data to ${absoluteOutputPath}`);
    }
});

stream.on('error', (error) => {
    console.error(`CSV read error: ${error.message}`);
    process.exit(1);
});

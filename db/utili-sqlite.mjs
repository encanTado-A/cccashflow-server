export default function utili_sqlite_function(db) {
    function getUserForLoginByUsername(username) {
        const stmt = db.prepare( 'SELECT * FROM Users WHERE username = ?' );
        const result = stmt.get( username );
        return result;
    }; // end getUserForLoginByUsername()

    function getUserByUsername(username) {
        const stmt = db.prepare( 'SELECT count(id) FROM Users WHERE username = ?' );
        const result = stmt.get( username );
        return result;
    }; // end getUserByUsername()

    function getUserById(id) {
        const stmt_result = db.prepare(`SELECT * from Users WHERE id = ?`).get( id );
        return stmt_result;
    }; // end getUserById
    
    function getHashPasswordByUsername(username) {
        const stmt = db.prepare( 'SELECT password FROM Users WHERE username = ?' );
        const result = stmt.get( username );
        return result;
    }; // end getHashPasswordByUsername()

    function updateAccountBalance() {
        const stmt = db.prepare( 
`SELECT TL.account_id, SUM( CASE WHEN TL.is_credit = 0 THEN amount ELSE 0 END ) - SUM( CASE WHEN TL.is_credit = 1 THEN amount ELSE 0 END ) AS "total_amount"
FROM TransactionsLedger AS TL LEFT JOIN Accounts AS ACCS
ON TL.account_id = ACCS.id
GROUP BY TL.account_id;` );
        const stmtresult = stmt.all();
        const result = JSON.stringify(stmtresult);
        // console.log(result);
        const today = new Date().toISOString().split('T')[0];
        // console.log(today); 
        
        const rowMapperAccountBalance = (row) => ({
            "account_id": row.account_id,
            "balance": row.balance, // row.balance >= 0 ? row.balance : Math.abs(row.balance),
            "updated_at": today
        });

        let insertMany = db.transaction ( (rows, stmt) => {
            for ( const row of rows ) 
                stmt.run(row);
        });

        const dataBuffer = [];
        const updateSQL = db.prepare( 
`UPDATE AccountBalance
SET balance = @balance , updated_at = @updated_at
WHERE account_id = @account_id`)

        try {
            stmtresult.forEach(element => {
                element["balance"] = Math.round(element["balance"]);
                dataBuffer.push(rowMapperAccountBalance(element));
                insertMany(dataBuffer, updateSQL);
            });
        } 
        catch (error) {
            console.error( "SQLite INSERT error:", sqlite_error.message );
            throw error;
        }

        return 0;
    }; // end updateAccountBalance()

    return { 
        getUserForLoginByUsername,
        getUserByUsername, 
        getUserById,
        getHashPasswordByUsername,
        updateAccountBalance
    };
}

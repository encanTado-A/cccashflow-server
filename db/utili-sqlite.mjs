export default function utili_sqlite_function(db) {
    function getUserForLoginByUsername(username) {
        const stmt = db.prepare( 'SELECT * FROM Users WHERE username = ?' );
        const result = stmt.get( username );
        return result;
    };

    function getUserByUsername(username) {
        const stmt = db.prepare( 'SELECT count(id) FROM Users WHERE username = ?' );
        const result = stmt.get( username );
        return result;
    };

    function getUserById(id) {
        const stmt_result = db.prepare(`SELECT * from Users WHERE id = ?`).get( id );
        return stmt_result;
    };
    
    function getHashPasswordByUsername(username) {
        const stmt = db.prepare( 'SELECT password FROM Users WHERE username = ?' );
        const result = stmt.get( username );
        return result;
    };

    return { 
        getUserForLoginByUsername,
        getUserByUsername, 
        getUserById,
        getHashPasswordByUsername 
    };
}

// officical
import express from 'express';

// local js
import logger from './logger.mjs';

export default function createRouter(db, __dirname) {
    const router = express.Router();

    router.get('/', logger, async (req, res) => {
        res.send("home");
    }); // end get(/)
    
    router.get('/transaction', logger, async (req, res) => {
        res.render('transaction', { title: 'Add Transaction' });
    }); // end get(/transaction)
    
    router.post('/transaction', logger, async (req, res) => {
        const data = req.body;
        console.log("info: Request Body: " + JSON.stringify(req.body, null, 2));
    
        const target_description = req.body.description;
        const target_created_at = req.body.created_at;
        const target_metadata = req.body.metadata;
        const target_is_deleted = req.body.is_deleted;
    
        // --- INSERT INTO transactionJournal (id, description) VALUE (@id, @description) ---
        const stmt = db.prepare('INSERT INTO transactionJournal (id, description, created_at, metadata, is_deleted) VALUES (@description, @created_at, @metadata, @is_deleted)');
        let info = null;
        try {
            info = stmt.run({
                description: target_description, 
                created_at: target_created_at, 
                metadata: target_metadata, 
                is_deleted: target_is_deleted
            });
        }
        catch (SqliteError) {
            res.status(422).json({ 
                status: "failed", 
                message: `data received but invalid currency!  currency: ${target_id}  description: ${target_description}`, 
                details: `SQLite Error: ${SqliteError.message}`
            });
        }
    
        if ( info && info.changes != 1 ) {
            res.status(422).json({ 
                status: "failed", 
                message: `data received but invalid currency!  currency: ${target_id}  description: ${target_description}` 
            });
        }
        
        res.status(200).json({ 
            status: "success", 
            message: `data well received!  new currency: ${target_id}  description: ${target_description}` 
        });
    }); // end post(/transaction)
    
    router.get('/demo/transaction', logger, async (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'input-form.html'));
    }); // end get(/demo/transaction)
    
    router.post('/demo/transaction', logger, async (req, res) => {
        const data = req.body;
        console.log(`Received data: \n${data}`);
        console.log("Request Body: " + JSON.stringify(req.body, null, 2));
        
        res.status(200).json({ 
            status: "success", 
            message: `data well received!` 
        });
    }); // end post(/demo/transaction)
    
    router.get('/currency', logger, async (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'new-currency.html'));
    }); // end get(/currency)
    
    router.post('/currency', logger, async (req, res) => {
        const data = req.body;
        const target_id = req.body.id;
        const target_description = req.body.description;
    
        console.log("Request Body: " + JSON.stringify(req.body, null, 2));
        console.log(`parsed id: ${target_id}, parsed description: ${target_description}`);
    
        // --- INSERT INTO Currency (id, description) VALUE (@id, @description) ---
        const stmt = db.prepare('INSERT INTO Currency (id, description) VALUES (@id, @description)');
        let info = null;
        try {
            info = stmt.run({id: target_id, description: target_description});
        }
        catch (SqliteError) {
            res.status(422).json({ 
                status: "failed", 
                message: `data received but invalid currency!  currency: ${target_id}  description: ${target_description}`, 
                details: `SQLite Error: ${SqliteError.message}`
            });
        }
    
        if ( info && info.changes != 1 ) {
            res.status(422).json({ 
                status: "failed", 
                message: `data received but invalid currency!  currency: ${target_id}  description: ${target_description}` 
            });
        }
        
        // Send a JSON response back to the frontend
        res.status(200).json({ 
            status: "success", 
            message: `data well received!  new currency: ${target_id}  description: ${target_description}` 
        });
    }); // end post(/currency)
    
    return router;
}; // end createRouter()

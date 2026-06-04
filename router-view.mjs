// officical
import express from 'express';

// local js
import logger from './logger.mjs';

export default function createRouter(db, __dirname) {
    const router = express.Router();

    router.get('/tables', logger, async (req, res) => {
        res.render('default-query-display', { title: 'view home' });
    }); // end get(/)

    router.get('/dashboard', logger, async (req, res) => {
        res.status(200).render("dashboard", { title: 'Dashboard' });
    }); // end get(/)

    router.get('/currency', logger, async (req, res) => {
        res.status(302).redirect('/view/tables');
    }); // end get(/currency)
    
    router.get('/transaction', logger, async (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'input-form.html'));
    }); // end get(/transaction)
    
    return router;
}; // end createRouter()

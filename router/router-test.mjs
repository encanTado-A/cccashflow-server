
// officical
import express from 'express';

// local js
import logger from '../middleware/logger.mjs';

// --------------------------------------------------

export default function createRouter(db, __dirname) {
    const router = express.Router();

    router.get('/', logger, async (req, res) => {
        res.render('test-dashboard', { title: 'Home', username: 'Andrew' });
    });

    router.get('/accounts', logger, async (req, res) => {
        res.render('test-account', { title: 'Accounts', username: 'Andrew' });
    });

    router.get('/currency', logger, async (req, res) => {
        res.render('test-currency', { title: 'Currency', username: 'Andrew' });
    });

    router.get('/report', logger, async (req, res) => {
        res.render('test-report', { title: 'Report', username: 'Andrew' });
    });

    router.get('/export', logger, async (req, res) => {
        res.render('test-export', { title: 'Export', username: 'Andrew' });
    });

    router.get('/record', logger, async (req, res) => {
        const query_body = req.body;
        res.render('test-record', { title: 'record', username: 'Andrew' });
    });

    // --------------------------------------------------
    // ai fast track

    router.get('/ai/', logger, async (req, res) => {
        res.redirect(`/test/ai/dashboard`);
    });

    router.get('/ai/dashboard', logger, async (req, res) => {
        res.render('test-dashboard-ai', { title: 'Home', username: 'Andrew' });
    });

    router.get('/ai/accounts', logger, async (req, res) => {
        res.render('test-dashboard-ai', { title: 'Accounts', username: 'Andrew' });
    });

    router.get('/ai/currency', logger, async (req, res) => {
        res.render('test-dashboard-ai', { title: 'Currency', username: 'Andrew' });
    });

    router.get('/ai/report', logger, async (req, res) => {
        res.render('test-dashboard-ai', { title: 'Report', username: 'Andrew' });
    });

    router.get('/ai/export', logger, async (req, res) => {
        res.render('test-dashboard-ai', { title: 'Export', username: 'Andrew' });
    });

    router.get('/ai/record', logger, async (req, res) => {
        const query_body = req.body;
        res.render('test-dashboard-ai', { title: 'record', username: 'Andrew' });
    });

    router.get('/ai/sensitive', logger, async (req, res) => {
        // passport.authenticate('local', { failureRedirect: '/login' });


        res.sendfile(`you found me`);
    });

    router.get('/ai/login', logger, async (req, res) => {
        return res.render('test-login', { title: 'Login', username: 'Andrew' });
    });

    router.post('/ai/login', logger, async (req, res) => {
        // const query_body = req.body;
        console.log("Request Body: " + JSON.stringify(req.body, null, 2));

        if ( ! req.body ) {
            console.log( `error: null detected!`);
        }

        const username = req.body.username;
        const password = req.body.user_password;

        try {
            const stmt_result = db.prepare(`SELECT * from User WHERE username = ?`).all( username );
            if ( !stmt_result || stmt_result.length < 1 ) {
                console.log( `status: user not found` );
                return res.json( { "status": "failed", "message": `user not found` } );
            }

            // console.log( `san-check: ${stmt_result}` );
            console.log( `san-check: ${JSON.stringify(stmt_result, null, 2)}` );
            
            console.log( typeof password, typeof stmt_result[0].password );

            if ( password === stmt_result[0].password) {
                console.log( `status: user ${stmt_result[0].username} login in` );
            }
            else {
                console.log( `flag: user ${stmt_result[0].username} login attempt` );
                return res.json( { "status": "error", "message": `password incorrect` } );
            }
        }
        catch (err) {
            console.log( `error: ${err}`);
            return res.json( { "status": "error", "message": `${err}` } );
        }
        
        return res.redirect('/test/ai/dashboard');
    });
    
    router.get('/ai/register', logger, async (req, res) => {
        return res.render('test-register', { title: 'Register', username: 'Andrew' });
    });

    router.post('/ai/register', logger, async (req, res) => {
        const query_body = req.body;
        return res.render('test-dashboard-ai', { title: 'Register', username: 'Andrew' });
    });

    // --------------------------------------------------
    // archive

    router.get('/old/testejs', logger, async (req, res) => {
        res.render('test', { title: 'Home', username: 'Andrew' });
    }); 

    return router;
}; // end createRouter();
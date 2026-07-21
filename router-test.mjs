
// officical
import express from 'express';

// local js
import logger from './logger.mjs';

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

    // --------------------------------------------------
    // archive

    router.get('/old/testejs', logger, async (req, res) => {
        res.render('test', { title: 'Home', username: 'Andrew' });
    }); 

    return router;
}; // end createRouter();
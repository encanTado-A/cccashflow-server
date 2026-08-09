// officical
import express from 'express';

export default function createRouter(db, logger, __dirname) {
    const router = express.Router();

    router.get('/tables', logger, async (req, res) => {
        // ai
        const queryTableName = req.query.table_name; 
        console.log(`Query data received: ${queryTableName}`);
        res.render('basic/basic-query-display', { 
            title: 'view tables', 
            tableSelect: queryTableName || null
        });
        // console.log(`/tables :: req.body: ${req.query}`);
        // res.render('basic-query-display', { title: 'view tables' });
    }); // end get(/tables)

    // router.get('/tables/:table_name', logger, async (req, res) => {
    //     console.log(`/tables:table_name :: req.body: ${req.query}`);
    //     // const tmp = table_name;
    //     const the_table_name = req.params.table_name;
    //     console.log(`the_table_name: ${the_table_name}`);
    //     res.render('basic-query-display', { title: 'view tables', tableSelect: the_table_name });
    // }); // end get(/tables/:table_name)

    router.get('/dashboard', logger, async (req, res) => {
        res.status(200).render("dashboard", { title: 'Dashboard', username: 'Andrew'});
    }); // end get(/)

    router.get('/currency', logger, async (req, res) => {
        res.redirect('/view/tables');
    }); // end get(/currency)
    
    router.get('/transaction', logger, async (req, res) => {
        res.redirect('/view/tables');
    }); // end get(/transaction)

    router.get('/transaction/delete_record', logger, async (req, res) => {
        // TBC
        res.redirect('/view/tables');
    }); // end get(/currency)
    
    return router;
}; // end createRouter()

// sample code from https://mherman.org/blog/node-passport-and-postgres/
import passport from 'passport';

export default function (db, __dirname) {

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        try {
            const stmt_result = `SELECT * from User WHERE id = ?`.all( id );

        }
        catch (err) {
            done(err,null);
        }
    });

    return {};
};
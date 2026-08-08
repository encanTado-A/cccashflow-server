import passportLocal from 'passport-local';

const LocalStrategy = passportLocal.Strategy;

export default function initializePassport(passport, bcrypt, utiliSqlite) {
    console.log( `loaded passport.mjs` );    
    async function authenticateUser(username, password, done) {
        try {
            const user = utiliSqlite.getUserForLoginByUsername( username );
            if ( !user ) {
                console.log( `status: passport: Incorrect username.` );
                return done(null, false, { message: 'Incorrect username or password.' });
                // done useage: done('error', state?, json)
            }
            const match = await bcrypt.compare(password, user.password);
            if ( match ){
                console.log( `status: passport: user found ${user.username}` );
                return done(null, user);
            }
            else {
                console.log( `status: passport: user found ${user.username} but incorrect password` );
                return done(null, false, { message: 'Incorrect username or password.' });
            }
        }
        catch (err) {
            return done(err);
        }
    }; // end authenticateUser()

    passport.use(new LocalStrategy( { 
        usernameField: 'username',
        passwordField: 'user_password'
        },
        authenticateUser)
    ); // end passport.use()

    passport.serializeUser((user, done) => {
        console.log( `status: passport: serializeUser ${user.username}` );
        return done(null, user.id);
    }); // end passport.serializeUser()

    passport.deserializeUser((id, done) => {
        try {
            const result = utiliSqlite.getUserById( id );
            if (!result) {
                return done(null, false);
            }
            console.log( `status: passport: deserialize User ${result.username}` );
            return done(null, result);
        }
        catch (err) {
            return done(err, null);
        }
    }); // end passport.deserializeUser()
}
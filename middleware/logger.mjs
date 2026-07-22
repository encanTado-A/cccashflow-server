// a console logger to view success request
const logger = (req, res, next) => {
    const method = req.method;
    // const url = req.url;
    const fullURL = req.originalUrl; // suggestion from gemini
    
    // method 1
    // const year = new Date().getFullYear();
    // const month = new Date().getUTCMonth() + 1;
    // const day = new Date().getUTCDate();
    
    // console.log(`${method} ${url} ${year}-${month}-${day}`);
    
    // method 2
    const date = new Date();
    
    // console.log(`${date} ${method} ${url}`);
    console.log(`${date.toISOString()} ${method} ${fullURL}`);
    next();
}

export default logger;
const jwt = require('jsonwebtoken')

// authenticate user before giving access to specific routes
const authenticateUsers = (req, res, next) => {
    
    const authToken = req.cookies.jwtToken
    
    const secret_key = process.env.SECRET_KEY;
    
    jwt.verify(authToken, secret_key, (err, decoded)=>{
        if(err){
            // if jwt expired-send response to client and ask them to login again
            // i.e., redirect to loginPage
            return res.send(`${err.message}--Re-directing to login page`)
        }
        req.user = decoded;
        next();
    })
    
}


module.exports = authenticateUsers;
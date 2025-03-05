const jwt = require('jsonwebtoken')


// middleware to check authorization of the request
const AuthorizeUser = (req, res, next) =>{
        
    const authToken = req.cookies.jwtToken;
    //  console.log(authToken)
    const secret_key = process.env.SECRET_KEY
    // fetch data from the requested jwt token
    try {
        jwt.verify(authToken, secret_key, (err, decoded)=>{
            // console.log(req.url)
            if(err){
                return res.send(`${err.message}--Re-directing to login page`)
            }else{
                // check the decoded credentials to check access rights
                // console.log(decoded)
                if(decoded.role === 'Admin'){
                    next();
                }else{
                    return res.send("Un-Authorized to access this route")
                }
            }
        })    
    } catch (error) {
        res.send(error)
    }
}

module.exports = AuthorizeUser;
const jwt = require("jsonwebtoken");

const checkUser = (user_token)=>{
        
    const secret_key = process.env.SECRET_KEY;
    return jwt.verify(user_token, secret_key, (err, decoded)=>{
        if(err){
            return err
        }else{
            return decoded
        }
    })
}

module.exports = checkUser;
const jwt = require("jsonwebtoken");

function decodeJwt(token){
  //console.log("this is token: " + token);
    //if (!token) {
    //  return 'No token provided';
    //}
  return new Promise(function(resolve, reject) {
    jwt.verify(token, "vedant", (err, decoded) => {
      if (err) {
        return 'Invalid token';
      }
  
      // If the token is valid, store the decoded payload for further use
      
      const payload = {
        orgId: decoded.orgId,
        userId: decoded.userId,
        collegeId: decoded.collegeId
      };

      //console.log("this is decoded : " + JSON.stringify(payload) );
     
      resolve(payload);
    });
  });
}

module.exports = decodeJwt;
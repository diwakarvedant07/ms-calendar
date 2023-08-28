const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.headers["x-access-token"]; // Assuming the token is sent in the 'Authorization' header
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
  
      // If the token is valid, store the decoded payload for further use
      req.user = decoded;
      next();
    });
  };

  module.exports = verifyToken;
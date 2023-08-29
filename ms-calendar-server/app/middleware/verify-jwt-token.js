const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  
    //req.user.orgId = 456;
    //req.user.collegeId = 123;
    //req.user.userId = 12345;
    next();
  };

  module.exports = verifyToken;
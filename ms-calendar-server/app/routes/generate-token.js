const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyApiKey = require("../middleware/verify-api-key.js");

router.get('/',verifyApiKey, function(req, res){
    try {
        //const token = jwt.sign(
        //    {
        //        orgId : 456,
        //        collegeId : 123,
        //        userId : 12345
        //    },
        //     "vedant", 
        //    {
        //    expiresIn: 3600,
        //    }
        //);
        //console.log("---------------------------------------");
        //console.log("  |  Token Generated  |");
        //console.log("---------------------------------------");
        res.status(200).send({token : "success"});
    } catch (e) {
        console.log(e);
        res.status(400).send({response : "Unauthorized"})
    }
    
});

module.exports = router;
const UserModel = require("../models/user-login-model");

const verifyApiKey = async (req, res, next) => {
    //console.log("---------------------------------------");
    //console.log("  |  Verifying API key |");
    if (req.headers["x-auth-token"] === process.env.API_KEY) {
        //console.log("  |  API key verified  |");
        try {
            const data = await UserModel.findOne({orgId : Number(req.headers["orgid"]) , collegeId : Number(req.headers["collegeid"]) , userId : Number(req.headers["userid"])});
        //console.log(req.headers)
        if(data == null) {
            res.status(401).send("No access to user");
        }
        } catch (e) {
            res.status(400).send("Unauthorized Headers required");
        }
        
        next();
    }
    else {
        //console.log("  |  API key not verified  |");
        res.status(401).send("API key not verified");
    }

}

module.exports = verifyApiKey;
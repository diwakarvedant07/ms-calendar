const CalendarModel = require("../models/ms-calendar-model");

const verifyApiKey = async (req, res, next) => {
    //console.log("---------------------------------------");
    //console.log("  |  Verifying API key |");
    //to change api key
    if ("8779bad8-4022-11ee-be56-0242ac120002" === "8779bad8-4022-11ee-be56-0242ac120002") {
        //console.log("  |  API key verified  |");
        //try {
        //    const data = await CalendarModel.findOne({orgId : Number(req.headers["orgid"]) , collegeId : Number(req.headers["collegeid"]) , userId : Number(req.headers["userid"])});
        ////console.log(req.headers)
        //if(data == null) {
        //    res.status(401).send("No access to user");
        //}
        //} catch (e) {
        //    res.status(400).send("Unauthorized Headers required");
        //}
        
        next();
    }
    else {
        //console.log("  |  API key not verified  |");
        res.status(401).send("API key not verified");
    }

}

module.exports = verifyApiKey;
const express = require("express");
const router = express.Router();
const NotificationModel = require("../models/notification-model");
const { get } = require("mongoose");
const verifyJWT = require("../middleware/decode-jwt.js");
//getting all
router.get("/", async (req, res) => {
  //console.log("Fetching Data : ");
  res.status(404).send("session not found");
});
//getting one
router.get("/:id", verifyJWT, targetData, (req, res) => {
  //console.log("get with Id is getting called");
  res.send({ resp : res.targetData });
});
//post patch and delete request
{
// creating one
router.post("/", verifyJWT , async (req, res) => {
    res.send({ resp : "hello from post request" });
});
// updating one
router.patch("/:id", verifyJWT , targetData , async (req, res) => {
    res.send({ resp : "hello from patch request" });
});
// deleting one

router.delete("/:id",verifyJWT, targetData , async (req, res) => {
    res.send({ resp : "hello from delete request" });
});
}
async function targetData(req, res, next) {
    let moreData;
    try {
        moreData = await NotificationModel.findOne({orgId : req.user.orgId, collegeId : req.user.collegeId, userId : req.user.userId, _id : req.params.id});
        if (moreData == null) {
            return res.status(404).json({ error: "No such data found" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
    //console.log("this moredata from targetData : " , moreData)
    res.targetData = moreData;
    //console.log("this is targetData from targetData : " , res.targetData);
    next();
}



module.exports = router;

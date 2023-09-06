const express = require("express");
const router = express.Router();
const UserModel = require("../models/user-login-model");
const { get } = require("mongoose");
const verifyAPI = require("../middleware/verify-api-key");
//getting all

router.get("/", async (req, res) => {
  console.log("Fetching users : ");
  const eventData = await UserModel.find({});
  res.status(200).send(eventData);
});
//getting one
router.get("/:id", targetData, (req, res) => {
  //console.log("get with Id is getting called");
  res.send({ resp : res.targetData });
});
// creating one
router.post("/", async (req, res) => {
  try {
    //console.log(req.body);
    const userModel = new UserModel(req.body);
    await userModel.save();
    //console.log("data saved");
    res.status(201).json(userModel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// updating one
router.patch("/:id", targetData , async (req, res) => {
//   if(req.body.eveName != null && req.body.eveName != "") {
//     res.targetData.eveName = req.body.eveName;
//   }
  try {
    const updatedForm = await res.targetData.save()
    res.json(updatedForm)
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
});
// deleting one

router.delete("/:id", targetData , async (req, res) => {
    try { 
      
        await UserModel.deleteOne({orgId : req.user.orgId, collegeId : req.user.collegeId, userId : req.user.userId, _id : req.params.id})
        //await res.targetData.remove();
        res.status(200).json({ respone : "deleted"})
    }catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function targetData(req, res, next) {
    let moreData;
    try {
        moreData = await UserModel.findOne({ _id : req.params.id});
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

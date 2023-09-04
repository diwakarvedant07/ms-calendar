const express = require("express");
const router = express.Router();
const AcademicModel = require("../models/academic-model");
const { get } = require("mongoose");
const verifyJWT = require("../middleware/verify-jwt-token.js");
//getting all
router.get("/", verifyJWT, async (req, res) => {
  //console.log("Fetching academic events : ");
  const eventData = await AcademicModel.find({orgId : req.user.orgId, collegeId : req.user.collegeId, tags : { $in: ["academic","holiday"]}});
  //, tags : { $in: ["academic","holiday"]}
  //eventData = await AcademicModel.find({orgId : req.user.orgId, collegeId : req.user.collegeId, tags : "holiday"});
  res.status(200).send(eventData);
});
//getting one
router.get("/:id", verifyJWT, targetData, (req, res) => {
  //console.log("get with Id is getting called");
  res.send({ resp : res.targetData });
});
// creating one
router.post("/", verifyJWT , async (req, res) => {
  try {
    //console.log("this is req.body");
    req.body.orgId = req.user.orgId;
    req.body.collegeId = req.user.collegeId;
    req.body.userId = req.user.userId;
    //console.log(req.body);
    const calendarModel = new AcademicModel(req.body);
    await calendarModel.save();
    //console.log("data saved");
    res.status(201).json(calendarModel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// updating one
router.patch("/:id", verifyJWT , targetData , async (req, res) => {
  if(req.body.eveName != null && req.body.eveName != "") {
    res.targetData.eveName = req.body.eveName;
  }
  if(req.body.eveDes!= null) {
    res.targetData.eveDes = req.body.eveDes;
  }
  if(req.body.sdate!= null && req.body.sdate != "") {
    res.targetData.sdate = req.body.sdate;
  }
  if(req.body.edate!= null && req.body.edate != "") {
    res.targetData.edate = req.body.edate;
  }
  if(req.body.eventColor!= null) {
    res.targetData.eventColor = req.body.eventColor;
  }
  try {
    const updatedForm = await res.targetData.save()
    res.json(updatedForm)
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
});
// deleting one

router.delete("/:id",verifyJWT, targetData , async (req, res) => {
    try { 
      
        await AcademicModel.deleteOne({orgId : req.user.orgId, collegeId : req.user.collegeId, userId : req.user.userId, _id : req.params.id})
        //await res.targetData.remove();
        res.status(200).json({ respone : "deleted"})
    }catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function targetData(req, res, next) {
    let moreData;
    try {
        moreData = await AcademicModel.findOne({orgId : req.user.orgId, collegeId : req.user.collegeId, _id : req.params.id});
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

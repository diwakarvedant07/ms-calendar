const express = require("express");
const router = express.Router();
const TagsModel = require("../models/tags-model");
const { get } = require("mongoose");
const verifyJWT = require("../middleware/verify-jwt-token.js");
//getting all
router.get("/", verifyJWT, async (req, res) => {
  //console.log("Fetching Data : ");
  const userData = {orgId : req.user.orgId, collegeId : req.user.collegeId, userId : req.user.userId};
  const generalData = {orgId : -1, collegeId : -1, userId : -1}
  const tagData = await TagsModel.find({ $or: [userData,generalData]} );
  res.status(200).send(tagData);
});
//getting one
router.get("/:id", verifyJWT, tagData, (req, res) => {
  //console.log("get with Id is getting called");
  res.send({ resp : res.tagData });
});
// creating one
router.post("/", verifyJWT , async (req, res) => {
  try {
    //console.log("using post method");
    req.body.orgId = req.user.orgId;
    req.body.collegeId = req.user.collegeId;
    req.body.userId = req.user.userId;
    //console.log(req.body);
    const tagModel = new TagsModel(req.body);
    await tagModel.save();
    //console.log("data saved");
    res.status(201).json(tagModel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// updating one
router.patch("/:id", verifyJWT , tagData , async (req, res) => {
  if(req.body.tagName!= null) {
    res.tagData.tagName = req.body.tagName;
  }
  if(req.body.tagColor!= null) {
    res.tagData.tagColor = req.body.tagColor;
  }
  try {
    const updatedForm = await res.tagData.save()
    res.json(updatedForm)
  } catch(e) {
    res.status(400).json({ error: e.message });
  }
});
// deleting one

router.delete("/:id",verifyJWT, tagData , async (req, res) => {
    try { 
      
        await TagsModel.deleteOne({orgId : req.user.orgId, collegeId : req.user.collegeId, userId : req.user.userId, _id : req.params.id})
        //await res.tagData.remove();
        res.status(200).json({ respone : "deleted"})
    }catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function tagData(req, res, next) {
    let moreData;
    try {
        moreData = await TagsModel.findOne({orgId : req.user.orgId, collegeId : req.user.collegeId, userId : req.user.userId, _id : req.params.id});
        if (moreData == null) {
            return res.status(404).json({ error: "No such data found" });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
    //console.log("this moredata from tagData : " , moreData)
    res.tagData = moreData;
    //console.log("this is tagData from tagData : " , res.tagData);
    next();
}



module.exports = router;

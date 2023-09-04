const express = require("express");
const router = express.Router();
const path = require("path");

//getting all
router.get("/", async (req, res) => {
    //console.log(__dirname); 
    res.sendFile(path.join(__dirname,'..','..','index.html'));
});
//getting one
router.get("/:id", (req, res) => {});
//post patch and delete request
{
// creating one
router.post("/", async (req, res) => {});
// updating one
router.patch("/:id", async (req, res) => {});
// deleting one

router.delete("/:id", async (req, res) => {});
}

module.exports = router;

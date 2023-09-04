const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  orgId: {
    type: Number,
  },
  collegeId: {
    type: Number,
  },
  userId: {
    type: Number,
  },
  tagName: {
    type : String,
    required : true
  },
  tagColor: {
    type : String,
    default : "#39FF14"
  }
});


module.exports = mongoose.model("Tag", tagSchema);

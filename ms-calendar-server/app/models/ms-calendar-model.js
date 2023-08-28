const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  orgId: {
    type: Number,
  },
  collegeId: {
    type: Number,
  },
  userId: {
    type: Number,
  },
  eveName: {
    type : String,
    required : true
  },
  eveDes: String,
  sdate: {
    type: Number,
    required: true
  },
  edate: Number,
  eventColor: {
    type: String,
    default: "purple"
  },
  hasSeen: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: ["academic"]
  }
});

module.exports = mongoose.model("Todo", todoSchema);

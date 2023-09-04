const mongoose = require("mongoose");

const academicSchema = new mongoose.Schema({
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
    default: "grey"
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

//const academicModel = mongoose.model('Academic', academicSchema);

module.exports = mongoose.model("Academic", academicSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  orgId: {
    type: Number,
  },
  collegeId: {
    type: Number,
  },
  userId: {
    type: Number,
  }
});


module.exports = mongoose.model("Users", userSchema);

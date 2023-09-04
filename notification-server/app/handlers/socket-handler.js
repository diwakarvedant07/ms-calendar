const decodeJwt = require("../middleware/decode-jwt");
const notificationModel = require("../models/notification-model");
const sortByDate = require("../middleware/sort-events-by-date");

module.exports = function (io) {
  var sortedEvents = [];
  var i = 0;
  io.on("connection", (socket) => {
    var flag = false;
    console.log("a user connected");
    //console.log('hello world');
    socket.on("Socket", (data) => {
      socket.broadcast.emit("Socket", data);
      console.log(data);
    });

    socket.emit("message", "Hello from server");

    socket.on("disconnect", (data) => {
      console.log(data);
      console.log("user disconnected");
    });

    socket.on("notification", async (data) => {
      try {
        if (flag === false) {
          //decode the token and get IDs.
          const userData = await decodeJwt(data.token);
          //fetch events based on the IDs from the database.
          // store events in a var while storing events in var check they have hasSeen false. if yes then store.
          // hasSeen has been set to false only for this template that we are using to search the DB
          userData.hasSeen = false;
          const events = await notificationModel.find(userData);
          // now we have a var with the date we need.
          // sort the var by date
          sortedEvents = sortByDate(events);
          socket.emit("notification-count", sortedEvents.length);
          //console.log("type of sortedevents : ", sortedEvents.length);
          for (var i = 0; i < 6; i++) {
            if (sortedEvents[0] == undefined) {
              console.log("undefined first time");
              break;
            }
            
            socket.emit("events", sortedEvents.shift());
            //console.log("length of sortedEvents : ", sortedEvents.length);
            
          }
          flag = true;
        } else {
          for (var i = 0; i < 6; i++) {
            if (sortedEvents[0] == undefined) {
              break;
            }
            socket.emit("events", sortedEvents.pop());
            //console.log("length of sortedEvents : ", sortedEvents.length);
          }
        }
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("setHasSeenTrue", async (data) => {
      var targetData = await notificationModel.findOne({ _id: data });
      targetData.hasSeen = true;
      await targetData.save();
    });

    //socket.on('notification', (data) => {
    //  socket.broadcast.emit('events', data);
    //})
  });
};

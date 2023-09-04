require("dotenv").config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIO = require('socket.io');
const mongoose = require("mongoose");
const socketHandlers = require('./app/handlers/socket-handler')

mongoose.connect("mongodb://localhost:27017/test", { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("ms-calendar-database : connected"));

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const corsConfig = {
  origin: '*' ,
}

app.use(express.json());
app.use(cors(corsConfig));

const htmlRouter = require("./app/routes/notification-html-route");
app.use("/" , htmlRouter);

const testRouter = require("./app/routes/notification-routes");
app.use("/notification/", testRouter);

//Socket Code
socketHandlers(io);

server.listen(4000, () => {
  console.log('notification-server  : connected');
});
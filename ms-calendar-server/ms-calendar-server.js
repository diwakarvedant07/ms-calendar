require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("ms-calendar-database : connected"));

app.use(express.json());
app.use(cors());

const userRouter = require("./app/routes/ms-calendar-routes.js");
app.use("/ms-calendar", userRouter);
const generateTokenRouter = require("./app/routes/generate-token.js");
app.use("/generate-token", generateTokenRouter);
const academicRouter = require("./app/routes/academic-event-route.js");
app.use("/academic-events", academicRouter);
const tagsRouter = require("./app/routes/tags-route.js");
app.use("/tags", tagsRouter);
const loginRouter = require("./app/routes/user-login-route.js");
app.use("/login", loginRouter);

app.listen(3000, () => console.log("ms-calendar-server : started"));

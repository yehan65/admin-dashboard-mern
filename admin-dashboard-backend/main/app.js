const express = require("express");
const cors = require("cors");
const methodOverride = require("method-override");

const adminRouter = require("../routes/admin.routes");
const userRouter = require("../routes/user.routes");
const postRouter = require("../routes/post.routes");
require("dotenv").config();
const app = express();

app.use(
  cors({
    origin: "https://admin-dashboard-mern.vercel.app",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "x-auth-token"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/post", postRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;

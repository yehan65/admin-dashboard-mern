const express = require("express");
const userController = require("../controllers/user.controller");
const userAuthController = require("../auth/user.auth");
const auth = require("../middlewares/auth.middleware");

const userRouter = express.Router();

userRouter.get("/loggedInUser", auth, userController.httpGetUser);
userRouter.post("/new", userController.httpCreateUser);
userRouter.post("/auth", userAuthController.httpUserLogin);
userRouter.put("/:userID/update", auth, userController.httpUpdateUser);
userRouter.delete("/:userID/delete", auth, userController.httpDeleteUser);

module.exports = userRouter;

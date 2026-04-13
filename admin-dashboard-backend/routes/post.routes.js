const express = require("express");

const postController = require("../controllers/post.controller");
const auth = require("../middlewares/auth.middleware");

const postRouter = express.Router();

postRouter.post("/:userID/new", auth, postController.httpCreatePost);
postRouter.put("/:postID/:userID/update", auth, postController.httpUpdatePost);
postRouter.delete(
  "/:postID/:userID/delete",
  auth,
  postController.httpDeletePost,
);

module.exports = postRouter;

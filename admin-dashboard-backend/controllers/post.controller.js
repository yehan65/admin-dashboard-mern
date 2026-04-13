const Post = require("../models/post.model");

class PostController {
  async httpCreatePost(req, res) {
    const userID = req.params.userID;
    const { title } = req.body;
    try {
      const post = new Post({
        title: title,
        author: userID,
      });

      await post.save();
      return res.status(200).json({ message: "Post Created ✅", post });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpUpdatePost(req, res) {
    const userID = req.params.userID;
    const postID = req.params.postID;
    const { title } = req.body;

    try {
      const post = await Post.findById(postID);
      if (!post) {
        return res.status(400).json({ message: "Oops, something went wrong." });
      }

      if (post.author.toString() !== userID) {
        return res.status(401).json({ message: "Unauthorized access!" });
      }

      const updatedPost = await Post.findByIdAndUpdate(
        postID,
        {
          title: title || post.title,
        },
        { new: true },
      );

      updatedPost.save();
      return res.status(201).json({ message: "Post updated", updatedPost });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpDeletePost(req, res) {
    const userID = req.params.userID;
    const postID = req.params.postID;

    try {
      const post = await Post.findById(postID);
      if (!post) {
        return res.status(400).json({ message: "Oops, something went wrong." });
      }

      if (post.author.toString() !== userID) {
        return res.status(401).json({ message: "Unauthorized access!" });
      }

      await Post.findByIdAndDelete(postID);
      return res.status(200).json({ message: "Post deleted ✅" });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }
}

const postController = new PostController();
module.exports = postController;

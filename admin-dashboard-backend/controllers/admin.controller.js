const Post = require("../models/post.model");
const User = require("../models/user.modle");
const bcrypt = require("bcrypt");
const cloudinary = require("../config/cloudinary");
// const cloudinary = require("cloudinary").v2;

class AdminController {
  async httpGeAllUsers(req, res) {
    const user = req.user;
    try {
      if (user.role !== "Admin") {
        return res.status(401).send("Unauthorized accesss!");
      }

      const allUsers = await User.find().select("-password");
      if (!allUsers) {
        return res.status(404).send("Empty database...");
      }

      return res.status(200).json({
        message: "All users are gathered!",
        length: allUsers.length,
        allUsers,
      });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpGetAdmin(req, res) {
    const userID = req.user._id;

    try {
      const user = await User.findById(userID);
      if (!user) {
        return res.status(400).json({ message: "Oops, somethig went wrong!" });
      }

      if (user.role !== "Admin") {
        return res.status(401).json({ message: "Unauthorized access!" });
      }

      if (userID !== user._id.toString()) {
        return res.status(401).json({ message: "Unauthorized access!" });
      }

      return res.status(200).json({ message: "User fetched ✅", user });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpCreateNewUser(req, res) {
    const user = req.user;
    const { name, email, password, role } = req.body;
    try {
      if (user.role !== "Admin") {
        return res.status(401).send("Unauthorized access!");
      }

      const userExsists = await User.findOne({ email: email });
      if (userExsists)
        return res.status(400).json({
          message: "This email is already exists. Try using a different one!",
        });

      const newUser = new User({
        name: name,
        email: email,
        password: password,
        role: role,
        status: "Active",
      });

      const saltRounds = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, saltRounds);

      if (newUser) {
        const token = newUser.generateAuthToken();
        await newUser.save();
        return res
          .header("x-auth-token", token)
          .status(201)
          .json({ message: "User created ✅", token, newUser });
      }
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR ${error}` });
    }
  }

  async httpUpdateAdminDetails(req, res) {
    const userID = req.user._id;
    // const userID = req.params.userID;
    const { name, email } = req.body;

    try {
      const user = await User.findById(userID);
      if (!user) {
        return res.status(400).json({ message: "No user found" });
      }

      if (user.role !== "Admin") {
        return res.status(401).json({ message: "Unauthorized access!" });
      }

      if (user._id.toString() !== userID) {
        return res
          .status(400)
          .json({ message: "Oops, cannot make the changes now." });
      }

      const userExsits = await User.findOne({ email: email });
      if (userExsits) {
        return res
          .status(400)
          .json({ message: "The email is already in use." });
      }

      const updateUser = await User.findByIdAndUpdate(
        userID,
        {
          name: name || user.name,
          email: email || user.email,
        },
        { new: true },
      );

      if (updateUser) {
        const token = updateUser.generateAuthToken();
        await updateUser.save();
        return res
          .header("x-auth-token", token)
          .status(201)
          .json({ message: "User Updated ✅", updateUser, token });
      }
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpAddAvatar(req, res) {
    const userID = req.user._id;
    try {
      const user = await User.findById(userID).select("-password");
      if (userID !== user._id.toString()) {
        return res.status(401).json({ message: "Unauthorized access!" });
      }

      if (user.role !== "Admin") {
        return res.status(401).json({ message: "Unauthorized access!" });
      }

      console.log(req.file);

      const result = cloudinary.uploader.upload_stream(
        { folder: "dashboard-api/admins" },
        async (error, uploaded) => {
          if (error) {
            throw error;
          }

          const userAvatar = await User.findByIdAndUpdate(
            userID,
            {
              avatar: uploaded.secure_url,
            },
            { new: true },
          );
          return res.status(200).json(userAvatar);
        },
      );
      result.end(req.file.buffer);

      // const updateAvatar = User.findByIdAndUpdate(userID, {
      //   avatar:
      // })
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpChangePassword(req, res) {
    const userID = req.user._id;
    const { currentPassword, newPassword } = req.body;
    try {
      const user = await User.findById(userID);
      if (user.role !== "Admin") {
        return res.status(403).json({ message: "Unauthorized access!" });
      }

      if (userID !== user._id.toString())
        return res.status(403).json({ message: "Unauthorized access!" });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Invalid password! Please try again" });
      }

      if (newPassword.length < 5) {
        return res
          .status(400)
          .json({
            message: "The new password should be at least 5 characters",
          });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();
      return res.status(200).json({ message: "Passoword updated ✅" });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpDeleteUsers(req, res) {
    const targetUserID = req.params.targetUserID;
    const user = req.user;
    try {
      if (user.role !== "Admin") {
        return res.status(401).send("Unauthorized accesss!");
      }

      await User.findByIdAndDelete(targetUserID);
      return res.status(200).json({ message: "User deleted ✅" });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpChangeUserRole(req, res) {
    const targetUserID = req.params.targetUserID;
    const user = req.user;
    const { role } = req.body;
    try {
      if (user.role !== "Admin") {
        return res.status(401).send("Unauthorized accesss!");
      }

      const updateUser = await User.findByIdAndUpdate(targetUserID, {
        role: role,
      });
      if (!updateUser) {
        return res
          .status(400)
          .json({ message: "Cannot update user!", updateUser });
      }
      return res.status(200).json({ message: "User updated ✅" });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpChangeUserStatus(req, res) {
    const targetUserID = req.params.targetUserID;
    const user = req.user;
    const { status } = req.body;
    try {
      if (user.role !== "Admin") {
        return res.status(401).send("Unauthorized accesss!");
      }

      const updateUser = await User.findByIdAndUpdate(targetUserID, {
        status: status,
      });
      if (!updateUser) {
        return res.status(400).json({ message: "Cannot update user!" });
      }
      return res.status(200).json({ message: "User updated ✅", updateUser });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpGetDashboardStats(req, res) {
    const user = req.user;
    try {
      if (user.role !== "Admin") {
        return res.status(401).json({ message: "Unauthorized access!" });
      }

      const totalUsers = await User.countDocuments();
      const totalPosts = await Post.countDocuments();
      const activeUsers = await User.countDocuments({
        status: "Active",
      });
      const suspendedUsers = await User.countDocuments({
        status: "Suspended",
      });

      const admins = await User.countDocuments({
        role: "Admin",
      });

      res.json({
        TotalUsers: totalUsers,
        TotalPosts: totalPosts,
        ActiveUsers: activeUsers,
        SuspendedUsers: suspendedUsers,
        Admins: admins,
      });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpGetChartData(req, res) {
    const user = req.user;
    try {
      const users = await User.find();

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const data = months.map((month, index) => {
        const count = users.filter((user) => {
          const date = user.createdAt;
          const month = date.getMonth();
          const matchingDate = month === index;
          return matchingDate;
        });
        return { name: month, users: count.length };
      });
      return res.status(200).send(data);
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpGeAllPosts(req, res) {
    const user = req.user;
    try {
      if (user.role !== "Admin") {
        return res.status(401).json({ message: "Unauthorized access!" });
      }
      const posts = await Post.find().populate("author", "_id name");
      if (!posts) {
        return res.status(404).json({ message: "No posts found" });
      }

      return res.status(200).json({ message: "Posts fetched ✅", posts });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpDeletePost(req, res) {
    const user = req.user;
    const postID = req.params.postID;
    try {
      if (user.role !== "Admin") {
        return res.status(401).json({ message: "Unauthorized access!" });
      }

      const post = await Post.findByIdAndDelete(postID);
      return res.status(200).json({ message: "Post deleted ✅", post });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }
}

const adminController = new AdminController();
module.exports = adminController;

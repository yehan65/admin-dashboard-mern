const User = require("../models/user.modle");
const bcrypt = require("bcrypt");

class UserController {
  async httpCreateUser(req, res) {
    const { name, email, password } = req.body;

    try {
      const userExists = await User.findOne({ email: email }).select(
        "-password",
      );
      if (userExists) {
        return res.status(400).json({
          message: "The email is alreay registered, try different one.",
        });
      }

      const newUser = new User({
        name: name,
        email: email,
        password: password,
        role: "User",
        status: "Active",
      });
      const rounds = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, rounds);

      if (newUser) {
        const token = newUser.generateAuthToken();
        await newUser.save();
        return res
          .header("x-auth-token", token)
          .status(201)
          .json({ message: "User created ✅", token });
      }
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpGetUser(req, res) {
    const userID = req.user._id;
    try {
      const user = await User.findById(userID);
      if (!user) {
        return res.status(400).json({ message: "Oops, somethig went wrong!" });
      }
      if (user._id.toString() !== userID) {
        return res.status(401).json({ message: "Unauthorized!" });
      }
      return res.status(200).message({ message: "User fetched ✅", user });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }

  async httpUpdateUser(req, res) {
    // const userID = req.user._id;
    const userID = req.params.userID;
    const { name, email } = req.body;

    try {
      const user = await User.findById(userID);
      if (!user) {
        return res.status(400).json({ message: "No user found" });
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

  async httpDeleteUser(req, res) {
    const userID = req.params.userID;
    try {
      const user = await User.findById(userID);
      if (!user) {
        return res.status(400).json({ message: "Oops, something went wrong." });
      }

      await User.findByIdAndDelete(userID);

      return res.status(200).json({ message: "Deleted ✅" });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }
}

const userController = new UserController();
module.exports = userController;

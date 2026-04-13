const User = require("../models/user.modle");
const bcrypt = require("bcrypt");

class UserAuthController {
  async httpUserLogin(req, res) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res
          .status(400)
          .json({ message: "Incorrect email and/or password" });
      }

      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        return res
          .status(400)
          .json({ message: "Incorrect email and/or password!" });
      }

      const token = user.generateAuthToken();

      return res.status(200).json({
        message: "User successfully login ✅",
        token,
        user: { id: user._id, role: user.role },
      });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }
}

const userAuthController = new UserAuthController();
module.exports = userAuthController;

const User = require("../models/user.modle");
const bcrypt = require("bcrypt");

class AdminAuthController {
  async httpAdminLogin(req, res) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res
          .status(400)
          .json({ message: "Incorrect email and/or password" });
      }

      if (user.role !== "Admin") {
        return res.status(401).json({ message: "Unauthorized Access!" });
      }

      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        return res
          .status(400)
          .json({ message: "Incorrect email and/or password!" });
      }

      const token = user.generateAuthToken();

      return res.status(200).json({
        message: "Admin successfully login ✅",
        token,
        user: { id: user._id, role: user.role, avatar: user.avatar },
      });
    } catch (error) {
      return res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
  }
}

const adminAuthController = new AdminAuthController();
module.exports = adminAuthController;

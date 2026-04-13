const express = require("express");

const adminOnly = require("../middlewares/admin.middleware");
const adminController = require("../controllers/admin.controller");
const adminAuthController = require("../auth/admin.auth");
const upload = require("../middlewares/upload.middleware");

const adminRouter = express.Router();

adminRouter.get("/getAdmin", adminOnly, adminController.httpGetAdmin);
adminRouter.get("/getAllUsers", adminOnly, adminController.httpGeAllUsers);
adminRouter.get("/getChartData", adminOnly, adminController.httpGetChartData);
adminRouter.get("/getAllPosts", adminOnly, adminController.httpGeAllPosts);
adminRouter.get(
  "/dashboardStats",
  adminOnly,
  adminController.httpGetDashboardStats,
);
adminRouter.post("/newUser", adminOnly, adminController.httpCreateNewUser);
adminRouter.post("/auth/admin", adminAuthController.httpAdminLogin);
adminRouter.delete(
  "/:targetUserID/user/delete",
  adminOnly,
  adminController.httpDeleteUsers,
);
adminRouter.delete(
  "/:postID/post/delete",
  adminOnly,
  adminController.httpDeletePost,
);
adminRouter.patch(
  "/updateAdmin",
  adminOnly,
  adminController.httpUpdateAdminDetails,
);
adminRouter.put(
  "/updateAvatar",
  adminOnly,
  upload.single("avatar"),
  adminController.httpAddAvatar,
);
adminRouter.patch(
  "/update/password",
  adminOnly,
  adminController.httpChangePassword,
);
adminRouter.put(
  "/:targetUserID/role/update",
  adminOnly,
  adminController.httpChangeUserRole,
);
adminRouter.put(
  "/:targetUserID/status/update",
  adminOnly,
  adminController.httpChangeUserStatus,
);

module.exports = adminRouter;

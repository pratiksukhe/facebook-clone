const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const {
  login,
  getAllUsers,
  getMe,
  addFriend,
  acceptFriendRequest,
  rejectFriendRequest,
  getAcceptedFriendRequest,
  getPendingRequest,
} = require("../controllers/users");

router.post("/login", login);
router.get("/all", isAuthenticated, getAllUsers);
router.get("/profile", isAuthenticated, getMe);
router.get("/:id/addfriend", isAuthenticated, addFriend);
router.get("/:id/accept-request", isAuthenticated, acceptFriendRequest);
router.get("/:id/reject-request", isAuthenticated, rejectFriendRequest);
router.get("/accepted-request", isAuthenticated, getAcceptedFriendRequest);
router.get("/pending-request", isAuthenticated, getPendingRequest);
module.exports = router;

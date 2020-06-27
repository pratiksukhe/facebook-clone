const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc      Login user
// @route     POST /api/user/login
// @access    Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate emaail & password
  if (!email || !password) {
    return res
      .status(400)
      .json({ msg: "Please provide valid email and password" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials..!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        msg: "Password doesn't match Please enter correct password..!",
      });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.megssae);
    res.status(500).send("Server error");
  }
};

// @desc      get current login user profile
// @route     GET /api/user/profile
// @access    PRIVATE
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("friends")
    .populate("friendRequests");
  if (!user) {
    return res.status(400).json({ msg: "Something is wrong" });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};
// @desc      Add friend(Send friend request to user)
// @route     GET /api/user/:id/addfriend
// @access    PRIVATE
exports.addFriend = async (req, res) => {
  try {
    //first finding the loggedin user in database
    const loggedInUser = await User.findById(req.user.id);
    //console.log(loggedInUser);

    //find the user which we are going to add
    const foundUser = await User.findById(req.params.id);
    console.log(foundUser);

    //check the user is already in foundUser's friendResquest or friend list
    if (
      foundUser.friendRequests.find((frdReqList) =>
        frdReqList._id.equals(loggedInUser._id)
      )
    ) {
      //console.log(frdReqList);

      return res.send(
        `You have already sent a friend request to ${foundUser.name}`
      );
    } else if (
      foundUser.friends.find((frdList) => frdList.id.equals(loggedInUser.id))
    ) {
      return res.send(
        `The user ${foundUser.name} is already in your friend list`
      );
    }

    let fromRequest = {
      _id: loggedInUser._id,
      name: loggedInUser.name,
    };

    foundUser.friendRequests.push(fromRequest);
    foundUser.save();
    res.json({
      success: true,
      msg: `You have successfully sent a frient request to ${foundUser.name}`,
    });
  } catch (error) {
    console.error(error.megssae);
    res.status(500).send("Server error");
  }
};

// @desc      Accept friend request
// @route     POST /api/user/:id/accept
// @access    PRIVATE
exports.acceptFriendRequest = async (req, res) => {
  try {
    //first finding the loggedin user in database
    const loggedInUser = await User.findById(req.user.id);

    //find the user which we are going to accept the request
    const foundUser = await User.findById(req.params.id);
    let result = loggedInUser.friendRequests.find((friendrequest) =>
      friendrequest._id.equals(foundUser.id)
    );

    if (result) {
      let index = loggedInUser.friendRequests.indexOf(result);
      loggedInUser.friendRequests.splice(index, 1);
      let friend = {
        _id: foundUser.id,
        name: foundUser.name,
      };
      loggedInUser.friends.push(friend);
      loggedInUser.acceptedFriendRequests.push(friend);
      loggedInUser.save();

      foundUser.friends.push(loggedInUser);
      foundUser.save();

      res.json({
        success: true,
        msg: `You and ${foundUser.name} are now friends`,
      });
    }
  } catch (error) {
    console.error(error.megssae);
    res.status(500).send("Server error");
  }
};

// @desc      Reject friend request
// @route     GET /api/user/:id/reject
// @access    PRIVATE
exports.rejectFriendRequest = async (req, res) => {
  try {
    //first finding the loggedin user in database
    const loggedInUser = await User.findById(req.user.id);

    //find the user which we are going to accept the request
    const foundUser = await User.findById(req.params.id);
    let result = loggedInUser.friendRequests.find((friendrequest) =>
      friendrequest._id.equals(foundUser.id)
    );

    if (result) {
      let index = loggedInUser.friendRequests.indexOf(result);
      loggedInUser.friendRequests.splice(index, 1);
      loggedInUser.save();
      res.json({
        success: true,
        msg: `You have successfully reject ${foundUser.name} friend request`,
      });
    }
  } catch (error) {
    console.error(error.megssae);
    res.status(500).send("Server error");
  }
};

// @desc      Fetch friend list which accepted friends request
// @route     GET /api/user/accepted-request
// @access    PRIVATE
exports.getAcceptedFriendRequest = async (req, res) => {
  try {
    //first finding the loggedin user in database
    const loggedInUser = await User.findById(req.user.id);

    res.status(200).json({
      acceptedFriendRequests: loggedInUser.acceptedFriendRequests,
    });
  } catch (error) {
    console.error(error.megssae);
    res.status(500).send("Server error");
  }
};

// @desc      get pending request list.
// @route     GET /api/user/pending-request
// @access    PRIVATE
exports.getPendingRequest = async (req, res) => {
  try {
    //first finding the loggedin user in database
    const loggedInUser = await User.findById(req.user.id);
    res.status(200).json({
      "Pending Request": loggedInUser.friendRequests,
    });
  } catch (error) {
    console.error(error.megssae);
    res.status(500).send("Server error");
  }
};
// @desc      suggested friends user
// @route     POST /api/user/all
// @access    Public
exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json({
      success: true,
      cout: allUsers.length,
      data: allUsers,
    });
  } catch (error) {
    console.error(error.megssae);
    res.status(500).send("Server error");
  }
};

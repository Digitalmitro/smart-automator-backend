const jwt = require("jsonwebtoken");
const { RegisterclientModal } = require("../models/TaskerModel/RegisterTasker");


const userAuth = async (req, res, next) => {
  try {
    const token = req.headers.token;
    const verifyToken =  jwt.verify(token, process.env.secret_key);

    console.log(verifyToken);

    const rootUser = await RegisterclientModal.findOne({ _id: verifyToken._id });

    console.log(rootUser);

    if (!rootUser) {
      throw new Error("User Not Found.");
    }

    req.token = token;
    req.rootUser = rootUser || rootAdmin;

    next();
  } catch (error) {
    res.status(401).send("Unauthorized : No token provided");
    console.log(error);
  }
};

module.exports = userAuth;

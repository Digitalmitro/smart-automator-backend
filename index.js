require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { connect } = require("./config/db");
const {
  RegisteradminModal,
} = require("./models/AdminModel/RegisterAdminModel");
const { RegisterclientModal } = require("./models/ClientModel/RegisterClient");
const { RegistertaskerModal } = require("./models/TaskerModel/RegisterTasker");
const { TaskerserviceModal } = require("./models/TaskerModel/TaskerService");

const { HomeAddressModal } = require("./models/ClientModel/HomeAddress");
const { WorkAddressModal } = require("./models/ClientModel/WorkAddress");
const { OrderModal } = require("./models/ClientModel/OrderList");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const userAuth = require("./middlewares/userAuth");
const server = express();
//to avoid cors error//
const connection = require("./config/db");
server.use(cors());
server.use(express.json());

const Port = process.env.port || 3500;

connection();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the extension
  },
});

// Initialize multer with the storage configuration
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|mkv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"));
    }
  },
});

// TEST //
server.get("/", async (req, res) => {
  try {
    return res
      .status(200)
      .json({ message: "Smart Automator API", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});

//ADMIN Section
// ADMIN  Register//
server.post("/registeradmin", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email already exists in the database
    const existingAdvisor = await RegisteradminModal.findOne({ email });

    if (existingAdvisor) {
      // If email already exists, send an error response
      res.status(400).send("Email already exists");
    } else {
      // Hash the password
      bcrypt.hash(password, 5, async (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          // Create a new instance of RegisteradvisorModal with the hashed password
          const newData = new RegisteradminModal({
            name,
            email,
            password: hash,
          });

          // Save the advisor data to the database
          await newData.save();

          // Send a success response
          res.send("Registered");
        }
      });
    }
  } catch (error) {
    // Handle other errors, such as missing details in the request
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
//ADMIN Login
server.post("/loginadmin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await RegisteradminModal.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            {
              _id: user._id,
              name: user.name,
              email: user.email,
            },
            "Tirtho"
          );
          res.json({
            status: "login successful",
            token: token,
            user: {
              name: user.name,
              email: user.email,

              _id: user._id,

              // Add other user details if needed
            },
          });
        } else {
          res.status(401).json({ status: "wrong entry" });
        }
      });
    } else {
      res.status(404).json({ status: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});
// Get all admins
server.get("/admins", async (req, res) => {
  try {
    const admins = await RegisteradminModal.find({});
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});

// Get admin by ID
server.get("/admins/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await RegisteradminModal.findById(id);
    if (admin) {
      res.json(admin);
    } else {
      res.status(404).json({ status: "admin not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});

// Delete admin by ID
server.delete("/admins/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await RegisteradminModal.findByIdAndDelete(id);
    if (admin) {
      res.json({ status: "admin deleted successfully", admin });
    } else {
      res.status(404).json({ status: "admin not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});

//Tasker Section
// Tasker Register//
// server.post("/registertasker", async (req, res) => {
//   const { firstName, lastName, email, phone, password, zip } = req.body;

//   try {
//     // Check if the email already exists in the database
//     const existingAdvisor = await RegistertaskerModal.findOne({ email });

//     if (existingAdvisor) {
//       // If email already exists, send an error response
//       res.status(400).send("Email already exists");
//     } else {
//       // Hash the password
//       bcrypt.hash(password, 5, async (err, hash) => {
//         if (err) {
//           console.log(err);
//         } else {
//           // Create a new instance of RegisteradvisorModal with the hashed password
//           const newData = new RegistertaskerModal({
//             firstName,
//             lastName,
//             email,
//             phone,
//             password: hash,
//             zip,
//           });

//           // Save the advisor data to the database
//           await newData.save();

//           // Send a success response
//           res.send("Registered");
//         }
//       });
//     }
//   } catch (error) {
//     // Handle other errors, such as missing details in the request
//     console.log(error);
//     res.status(500).send("Internal Server Error");
//   }
// });

server.post("/registertasker", async (req, res) => {
  const { email, password, phone, firstname, lastname, zip } = req.body;

  try {
    // Check if the email already exists in the database
    const existingAdvisor = await RegistertaskerModal.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    const registerDate = new Date();

    if (existingAdvisor) {
      // If email already exists, send an error response
      return res.status(400).send("User already exists");
    }
    // Create a new instance of RegisteradvisorModal with the hashed password
    const newData = new RegistertaskerModal({
      firstName: firstname,
      lastName: lastname,
      phone,
      password,
      email,
      zip,
    });

    // Save the advisor data to the database
    const registered = await newData.save();

    const token = await registered.generateAuthToken();

    registered.password = undefined;

    // Send a success response
    return res.status(200).json({
      message: "Registered successfully",
      token: token,
      user: registered,
    });
  } catch (error) {
    // Handle other errors, such as missing details in the request
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

//Tasker Login
// server.post("/logintasker", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await RegistertaskerModal.findOne({ email });
//     if (user) {
//       bcrypt.compare(password, user.password, (err, result) => {
//         if (result) {
//           const token = jwt.sign(
//             {
//               _id: user._id,
//               firstName: user.firstName,
//               lastName: user.lastName,
//               email: user.email,
//               phone: user.phone,
//               zip: user.zip,
//             },
//             "Tirtho"
//           );
//           res.json({
//             status: "login successful",
//             token: token,
//             user: {
//               _id: user._id,
//               firstName: user.firstName,
//               lastName: user.lastName,
//               email: user.email,
//               phone: user.phone,
//               zip: user.zip,

//               // Add other user details if needed
//             },
//           });
//         } else {
//           res.status(401).json({ status: "wrong entry" });
//         }
//       });
//     } else {
//       res.status(404).json({ status: "user not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: "internal server error" });
//   }
// });

server.post("/logintasker", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(422)
        .json({ message: "Please fill all the fields.", success: false });
    }

    const clientFound = await RegistertaskerModal.findOne({ email });

    if (clientFound) {
      const passCheck = await bcrypt.compare(password, clientFound.password);
      const token = await clientFound.generateAuthToken();

      clientFound.password = undefined;

      if (passCheck) {
        res.status(200).json({
          status: "login successful",
          token: token,
          user: clientFound,
        });
      } else {
        res
          .status(401)
          .json({ message: "Invalid login credentials", success: false });
      }
    } else {
      res.status(404).json({ status: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});

server.get("/logout-tasker", userAuth, async (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "logged out successfully!", success: true });
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get all taskers
server.get("/taskers", async (req, res) => {
  try {
    const taskers = await RegistertaskerModal.find({});
    res.json(taskers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});
// Get tasker by ID
server.get("/taskers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tasker = await RegistertaskerModal.findById(id);
    if (tasker) {
      res.json(tasker);
    } else {
      res.status(404).json({ status: "tasker not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});
// Delete tasker by ID
server.delete("/taskers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tasker = await RegistertaskerModal.findByIdAndDelete(id);
    if (tasker) {
      res.json({ status: "tasker deleted successfully", tasker });
    } else {
      res.status(404).json({ status: "tasker not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});

//Service Section For Tasker
// Create Service Tasker populate
server.post("/service", upload.single("image"), async (req, res) => {
  const {
    phone,
    userName,
    description,
    vehicle,
    serviceCategory,
    location,
    pricePerHour,
    totaltask,
    review,
    user_id,
  } = req.body;

  try {
    const newPackage = new TaskerserviceModal({
      image: req.file.filename, // Update to use req.file.filename
      phone,
      userName,
      description,
      vehicle,
      serviceCategory,
      location,
      pricePerHour,
      totaltask,
      review,
      user_id,
    });

    await newPackage.save();

    // Assuming RegistertaskerModal is defined elsewhere in your code
    await RegistertaskerModal.findByIdAndUpdate(
      user_id,
      { $push: { service: newPackage._id } },
      { new: true }
    );

    res.send("Service added");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
// Serve static files from the 'uploads' directory
server.use("/uploads", express.static(path.join(__dirname, "uploads")));

server.use(express.json());
//get all services
server.get("/service", async (req, res) => {
  try {
    // Retrieve all service records from the database
    const services = await TaskerserviceModal.find();

    // Send the retrieved records as a response
    res.status(200).json(services);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
//get by ID
server.get("/service/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Retrieve the service record by ID from the database
    const service = await TaskerserviceModal.findById(id);

    if (!service) {
      return res.status(404).send("Service not found");
    }

    // Send the retrieved record as a response
    res.status(200).json(service);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
//Populate service for takser
server.get("/service/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await RegistertaskerModal.findById(id).populate("service");
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
// Delete service by id
server.delete("/service/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await TaskerserviceModal.findByIdAndDelete(id);
    res.send("Product removed from cart");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
// Update services by id
server.put("/service/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body; // Assuming the request body contains the data to update

  try {
    const existingData = await TaskerserviceModal.findById(id);
    if (!existingData) {
      return res.status(404).send("Product not found");
    }

    // If there are new reviews to add, append them to the existing reviews
    if (updateData.review) {
      existingData.review = existingData.review.concat(updateData.review);
      delete updateData.review; // Remove review from updateData to avoid replacing it
    }

    // Update the document with the new data excluding the review field
    const updatedData = await TaskerserviceModal.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    // Save the document with the appended reviews if any
    if (existingData.review) {
      updatedData.review = existingData.review;
      await updatedData.save();
    }

    res.send(updatedData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

//client Section
// client Register//
// server.post("/registerclient", async (req, res) => {
//   const { firstName, lastName, email, phone, password, zip } = req.body;

//   try {
//     // Check if the email already exists in the database
//     const existingAdvisor = await RegisterclientModal.findOne({ email });

//     if (existingAdvisor) {
//       // If email already exists, send an error response
//       res.status(400).send("Email already exists");
//     } else {
//       // Hash the password
//       bcrypt.hash(password, 5, async (err, hash) => {
//         if (err) {
//           console.log(err);
//         } else {
//           // Create a new instance of RegisteradvisorModal with the hashed password
//           const newData = new RegisterclientModal({
//             firstName,
//             lastName,
//             email,
//             phone,
//             password: hash,
//             zip,
//           });

//           // Save the advisor data to the database
//           await newData.save();

//           // Send a success response
//           res.send("Registered");
//         }
//       });
//     }
//   } catch (error) {
//     // Handle other errors, such as missing details in the request
//     console.log(error);
//     res.status(500).send("Internal Server Error");
//   }
// });

server.post("/registerclient", async (req, res) => {
  const { email, password, phone, firstName, lastName, zip } = req.body;

  try {
    // Check if the email already exists in the database
    const existingAdvisor = await RegisterclientModal.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    const registerDate = new Date();

    if (existingAdvisor) {
      // If email already exists, send an error response
      return res.status(400).send("User already exists");
    }
    // Create a new instance of RegisteradvisorModal with the hashed password
    const newData = new RegisterclientModal({
      firstName,
      lastName,
      phone,
      password,
      email,
      zip,
    });

    // Save the advisor data to the database
    const registered = await newData.save();

    const token = await registered.generateAuthToken();

    registered.password = undefined;

    // Send a success response
    return res.status(200).json({
      message: "Registered successfully",
      token: token,
      user: registered,
    });
  } catch (error) {
    // Handle other errors, such as missing details in the request
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

//client Login
// server.post("/loginclient", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await RegisterclientModal.findOne({ email });
//     if (user) {
//       bcrypt.compare(password, user.password, (err, result) => {
//         if (result) {
//           const token = jwt.sign(
//             {
//               _id: user._id,
//               firstName: user.firstName,
//               lastName: user.lastName,
//               email: user.email,
//               phone: user.phone,
//               zip: user.zip,
//             },
//             "Tirtho"
//           );
//           res.json({
//             status: "login successful",
//             token: token,
//             user: {
//               _id: user._id,
//               firstName: user.firstName,
//               lastName: user.lastName,
//               email: user.email,
//               phone: user.phone,
//               zip: user.zip,

//               // Add other user details if needed
//             },
//           });
//         } else {
//           res.status(401).json({ status: "wrong entry" });
//         }
//       });
//     } else {
//       res.status(404).json({ status: "user not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: "internal server error" });
//   }
// });

server.post("/loginclient", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(422)
        .json({ message: "Please fill all the fields.", success: false });
    }

    const clientFound = await RegisterclientModal.findOne({ email });

    if (clientFound) {
      const passCheck = await bcrypt.compare(password, clientFound.password);
      const token = await clientFound.generateAuthToken();

      clientFound.password = undefined;

      if (passCheck) {
        res.status(200).json({
          status: "login successful",
          token: token,
          user: clientFound,
        });
      } else {
        res
          .status(401)
          .json({ message: "Invalid login credentials", success: false });
      }
    } else {
      res.status(404).json({ status: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});

server.get("/get-client", userAuth, async (req, res) => {
  try {
    const user = req.rootUser;

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    user.password = undefined;

    return res.status(200).json({
      message: "User fetched successfully !",
      success: true,
      user,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

server.get("/logout-client", userAuth, async (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "logged out successfully!", success: true });
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get all clients
server.get("/clients", async (req, res) => {
  try {
    const clients = await RegisterclientModal.find({});
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});
// Get client by ID
server.get("/clients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const client = await RegisterclientModal.findById(id);
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ status: "client not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});
// Delete client by ID
server.delete("/clients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const client = await RegisterclientModal.findByIdAndDelete(id);
    if (client) {
      res.json({ status: "client deleted successfully", client });
    } else {
      res.status(404).json({ status: "client not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "internal server error" });
  }
});

// server.put("/updateclient", async (req, res) => {
//   const {
//     firstName,
//     lastName,
//     email,
//     phone,
//     zip,
//     oldPassword,
//     newPassword,
//     user_id,
//   } = req.body;

//   try {
//     // Find user by ID
//     const user = await RegisterclientModal.findById(user_id);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Verify email
//     if (!email) {
//       return res.status(400).json({ error: "Email is required" });
//     }
//     if (email !== user.email) {
//       return res.status(400).json({ error: "Email must be the same" });
//     }

//     // Compare old password
//     const passwordMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!passwordMatch) {
//       return res.status(400).json({ error: "Old password is incorrect" });
//     }

//     // Hash the new password if provided
//     let hashedPassword = user.password; // default to old hashed password
//     if (newPassword) {
//       hashedPassword = await bcrypt.hash(newPassword, 10);
//     }

//     // Update user details
//     const updatedUser = await RegisterclientModal.findByIdAndUpdate(
//       user_id,
//       { firstName, lastName, email, phone, zip, password: hashedPassword },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Create JWT token
//     const token = jwt.sign(
//       {
//         _id: updatedUser._id,
//         firstName: updatedUser.firstName,
//         lastName: updatedUser.lastName,
//         email: updatedUser.email,
//         phone: updatedUser.phone,
//         zip: updatedUser.zip,
//       },
//       "Tirtho"
//     );

//     // Return the updated user and token
//     res.json({
//       status: "Update successful",
//       token: token,
//       user: {
//         _id: updatedUser._id,
//         firstName: updatedUser.firstName,
//         lastName: updatedUser.lastName,
//         email: updatedUser.email,
//         phone: updatedUser.phone,
//         zip: updatedUser.zip,
//         // Add other user details if needed
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

server.put("/updateclient", userAuth, async (req, res) => {
  const {
    firstName,
    lastName,
    displayName,
    phone,
    zip,
    email,
    oldPassword,
    newPassword,
  } = req.body;

  try {
    // Find user by ID
    const user = await RegisterclientModal.findById(req.rootUser._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let updateData = {
      firstName,
      lastName,
      displayName,
      email,
      phone,
      zip,
    };

    if (oldPassword && newPassword) {
      // Compare old password
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }

      // Hash the new password if provided
      let hashedPassword = user.password; // default to old hashed password
      if (newPassword) {
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }

      updateData = {
        firstName,
        lastName,
        displayName,
        email,
        password: hashedPassword,
        phone,
        zip,
      };
    } else if ((oldPassword && !newPassword) || (newPassword && !oldPassword)) {
      return res
        .status(400)
        .json({ error: "Both old and new passwords are required." });
    }

    // Update user details
    const updatedUser = await RegisterclientModal.findByIdAndUpdate(
      req.rootUser._id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Optionally, you can return the updated user as JSON
    res.json("Updated user details successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

server.post("/homeAddress", async (req, res) => {
  const { address1, address2, city, state, zip, addressType, user_id } =
    req.body;

  try {
    // Find the existing homecms document for the given user_id
    const existingPackage = await HomeAddressModal.findOne({ user_id });

    if (!existingPackage) {
      // If no existing document, create a new one
      const newPackage = new HomeAddressModal({
        address1,
        address2,
        city,
        state,
        zip,
        addressType,
        user_id,
      });

      // Save the new document to the database
      await newPackage.save();

      // Update the user's details array
      await RegisterclientModal.findByIdAndUpdate(
        user_id,
        { $push: { homeAddress: newPackage._id } },
        { new: true }
      );
    } else {
      // If an existing document is found, update its fields
      await HomeAddressModal.findOneAndUpdate(
        { user_id },
        {
          address1,
          address2,
          city,
          state,
          zip,
          addressType,
        },
        { new: true }
      );
    }

    // Send a success response
    res.send("Home Address added/updated successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

server.get("/homeAddress/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await RegisterclientModal.findById(id).populate("homeAddress");
    res.send({
      message: "get Address Data success",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

server.delete("/homeAddress/:id", async (req, res) => {
  const addressId = req.params.id;

  try {
    // Address exists, proceed with deletion
    await HomeAddressModal.findOneAndDelete(addressId);

    // Send a success response
    res.send("Home Address deleted successfully");
  } catch (error) {
    console.error("Error deleting home address:", error);
    res.status(500).send("Internal Server Error");
  }
});

server.delete("/workAddress/:id", async (req, res) => {
  const addressId = req.params.id;

  try {
    // Address exists, proceed with deletion
    await WorkAddressModal.findOneAndDelete(addressId);

    // Send a success response
    res.send("work Address deleted successfully");
  } catch (error) {
    console.error("Error deleting work address:", error);
    res.status(500).send("Internal Server Error");
  }
});

server.post("/workAddress", async (req, res) => {
  const { address1, address2, city, state, zip, addressType, user_id } =
    req.body;

  try {
    // Find the existing homecms document for the given user_id
    const existingPackage = await WorkAddressModal.findOne({ user_id });

    if (!existingPackage) {
      // If no existing document, create a new one
      const newPackage = new WorkAddressModal({
        address1,
        address2,
        city,
        state,
        zip,
        addressType,
        user_id,
      });

      // Save the new document to the database
      await newPackage.save();

      // Update the user's details array
      await RegisterclientModal.findByIdAndUpdate(
        user_id,
        { $push: { workAddress: newPackage._id } },
        { new: true }
      );
    } else {
      // If an existing document is found, update its fields
      await WorkAddressModal.findOneAndUpdate(
        { user_id },
        {
          address1,
          address2,
          city,
          state,
          zip,
          addressType,
        },
        { new: true }
      );
    }

    // Send a success response
    res.send("work Address added/updated successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
server.get("/workAddress/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await RegisterclientModal.findById(id).populate("workAddress");
    res.send({
      message: "get work Address Data success",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

server.delete("/workAddress/:id", async (req, res) => {
  const addressId = req.params.id;

  try {
    // Check if the home address exists
    const existingAddress = await WorkAddressModal.findOne({
      user_id: addressId,
    });
    if (!existingAddress) {
      // Address not found
      return res.status(404).send("Home Address not found");
    }

    // Address exists, proceed with deletion
    await WorkAddressModal.findOneAndDelete({ user_id: addressId });

    // Send a success response
    res.send("Home Address deleted successfully");
  } catch (error) {
    console.error("Error deleting home address:", error);
    res.status(500).send("Internal Server Error");
  }
});

//Order Section For Client
server.post("/order", async (req, res) => {
  const {
    image,
    phone,
    userName,
    description,
    vehicle,
    serviceCategory,
    location,
    orderTime,
    pricePerHour,
    totaltask,
    review,
    user_id,
  } = req.body;

  try {
    // Create a new instance of AdvisorpackageModel
    const newPackage = new OrderModal({
      image,
      phone,
      userName,
      description,
      vehicle,
      serviceCategory,
      location,
      orderTime,
      pricePerHour,
      totaltask,
      review,
      user_id,
    });

    // Save the package to the database
    await newPackage.save();

    // Update the user's packages array
    await RegisterclientModal.findByIdAndUpdate(
      user_id,
      { $push: { order: newPackage._id } },
      { new: true }
    );

    // Send a success response
    res.send("Order added");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
//get all services
server.get("/order", async (req, res) => {
  try {
    // Retrieve all service records from the database
    const services = await OrderModal.find();

    // Send the retrieved records as a response
    res.status(200).json(services);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
//Populate service for takser
server.get("/order/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await RegisterclientModal.findById(id).populate("order");
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

//SERVER
//server running
server.listen(Port, async () => {
  try {
    console.log(`server running at port ${Port}`);
  } catch (error) {
    console.log(error);
  }
});

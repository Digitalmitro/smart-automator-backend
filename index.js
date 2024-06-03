const express = require("express");

const bcrypt = require("bcrypt");
const { connect } = require("./config/db");
const {
  RegisteradminModal,
} = require("./models/AdminModel/RegisterAdminModel");
const { RegisterclientModal } = require("./models/ClientModel/RegisterClient");
const { RegistertaskerModal } = require("./models/TaskerModel/RegisterTasker");
const { TaskerserviceModal } = require("./models/TaskerModel/TaskerService");
const {OrderModal} = require("./models/ClientModel/OrderList")
const jwt = require("jsonwebtoken");
const cors = require("cors");
const server = express();
//to avoid cors error//
server.use(cors());
server.use(express.json());

//welcome message
server.get("/", (req, res) => {
  res.send("welcome");
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
server.post("/registertasker", async (req, res) => {
  const { firstName, lastName, email, phone, password, zip } = req.body;

  try {
    // Check if the email already exists in the database
    const existingAdvisor = await RegistertaskerModal.findOne({ email });

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
          const newData = new RegistertaskerModal({
            firstName,
            lastName,
            email,
            phone,
            password: hash,
            zip,
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
//Tasker Login
server.post("/logintasker", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await RegistertaskerModal.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              zip: user.zip,
            },
            "Tirtho"
          );
          res.json({
            status: "login successful",
            token: token,
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              zip: user.zip,

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
server.post("/service", async (req, res) => {
  const {
    image,
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
    // Create a new instance of AdvisorpackageModel
    const newPackage = new TaskerserviceModal({
      image,
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

    // Save the package to the database
    await newPackage.save();

    // Update the user's packages array
    await RegistertaskerModal.findByIdAndUpdate(
      user_id,
      { $push: { service: newPackage._id } },
      { new: true }
    );

    // Send a success response
    res.send("Service added");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
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
      const updatedData = await TaskerserviceModal.findByIdAndUpdate(id, updateData, { new: true });
  
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
server.post("/registerclient", async (req, res) => {
  const { firstName, lastName, email, phone, password, zip } = req.body;

  try {
    // Check if the email already exists in the database
    const existingAdvisor = await RegisterclientModal.findOne({ email });

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
          const newData = new RegisterclientModal({
            firstName,
            lastName,
            email,
            phone,
            password: hash,
            zip,
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
//client Login
server.post("/loginclient", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await RegisterclientModal.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              zip: user.zip,
            },
            "Tirtho"
          );
          res.json({
            status: "login successful",
            token: token,
            user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              zip: user.zip,

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
    res.send("Service added");
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
server.listen(3500, async () => {
  try {
    await connect;
    console.log("mongoDb connected");
  } catch (error) {
    console.log(error);
  }
  console.log(`server running at port 3500`);
});

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

const { AddressModal } = require("./models/ClientModel/Address");
const { WorkAddressModal } = require("./models/ClientModel/WorkAddress");
const { OrderModal } = require("./models/ClientModel/OrderList");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const userAuth = require("./middlewares/userAuth");
const server = express();
//to avoid cors error//
const connection = require("./config/db");
const { ServiceCategory } = require("./models/ServicesModel/ServiceCategories");
const adminAuth = require("./middlewares/adminAuth");
const Services = require("./models/ServicesModel/Services");
const uploadS3 = require("./middlewares/uploadS3");
const CmsModel = require("./models/AdminModel/CMS");
const BlogModel = require("./models/AdminModel/Blog");
const OrderModel = require("./models/ClientModel/OrderList");
const Testimonial = require("./models/AdminModel/Testimonial");
const PricingPlan = require("./models/AdminModel/Plan");

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
server.use("/uploads", express.static(path.join(__dirname, "uploads")));

// S3 File Upload
server.post("/upload", function (request, response, next) {
  uploadS3(request, response, function (error) {
    if (error) {
      console.log(error);
      return response.status(500).json({ message: error });
    }
    response.status(200).json({
      message: "File uploaded successfully.",
      success: true,
      fileUrl: `${process.env.S3_ENDPOINT}${fileName}`,
    });
  });
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
// server.post("/registeradmin", async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     // Check if the email already exists in the database
//     const existingAdvisor = await RegisteradminModal.findOne();

//     if (existingAdvisor) {
//       // If email already exists, send an error response
//       res.status(400).send("Admin already exists");
//     } else {
//       // Hash the password
//       bcrypt.hash(password, 5, async (err, hash) => {
//         if (err) {
//           console.log(err);
//         } else {
//           // Create a new instance of RegisteradvisorModal with the hashed password
//           const newData = new RegisteradminModal({
//             name,
//             email,
//             password: hash,
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

server.post("/registeradmin", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email already exists in the database
    const existingAdmin = await RegisteradminModal.findOne();

    if (existingAdmin) {
      // If email already exists, send an error response
      return res.status(400).send("Admin already exists");
    }
    // Create a new instance of RegisteradvisorModal with the hashed password
    const newData = new RegisteradminModal({
      name,
      email,
      password,
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

//ADMIN Login
// server.post("/loginadmin", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await RegisteradminModal.findOne({ email });
//     if (user) {
//       bcrypt.compare(password, user.password, (err, result) => {
//         if (result) {
//           const token = jwt.sign(
//             {
//               _id: user._id,
//               name: user.name,
//               email: user.email,
//             },
//             "Tirtho"
//           );
//           res.json({
//             status: "login successful",
//             token: token,
//             user: {
//               name: user.name,
//               email: user.email,

//               _id: user._id,

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

server.post("/loginadmin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(422)
        .json({ message: "Please fill all the fields.", success: false });
    }

    const adminFound = await RegisteradminModal.findOne({ email });

    if (adminFound) {
      const passCheck = await bcrypt.compare(password, adminFound.password);
      const token = await adminFound.generateAuthToken();

      adminFound.password = undefined;

      if (passCheck) {
        res.status(200).json({
          status: "login successful",
          token: token,
          user: adminFound,
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

// SERVICE CATEGORY APIS >>>>
server.post("/admin/add-service-category", adminAuth, async (req, res) => {
  try {
    const { name, description, image, logo } = req.body;
    if (!name || !image || !description) {
      return res.status(422).json({
        message:
          "Service category name , description and image must be provided!",
        success: false,
      });
    }
    const newCategory = new ServiceCategory({
      name: name.toLowerCase(),
      description,
      image,
      logo,
    });

    await newCategory.save();
    res.status(201).json({
      message: "Service category added successfully",
      category: newCategory,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add service category",
      error: error.message,
    });
  }
});

server.put("/admin/edit-service-category/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({
        message: "Service category ID is required!",
        success: false,
      });
    }

    if (updates.name) {
      updates.name = updates.name.toLowerCase();
    }

    // Update the category with only the provided fields
    const updatedCategory = await ServiceCategory.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        message: "Service category not found!",
        success: false,
      });
    }

    res.status(200).json({
      message: "Service category updated successfully",
      category: updatedCategory,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update service category",
      error: error.message,
    });
  }
});

server.delete(
  "/admin/delete-service-category/:id",
  adminAuth,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if ID is provided
      if (!id) {
        return res.status(400).json({
          message: "Service category ID is required!",
          success: false,
        });
      }

      // Delete the category by ID
      const deletedCategory = await ServiceCategory.findByIdAndDelete(id);

      if (!deletedCategory) {
        return res.status(404).json({
          message: "Service category not found!",
          success: false,
        });
      }

      res.status(200).json({
        message: "Service category deleted successfully",
        success: true,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete service category",
        error: error.message,
      });
    }
  }
);

server.get("/admin/service-categories", adminAuth, async (req, res) => {
  try {
    const categories = await ServiceCategory.find();

    res.status(200).json({
      message: "Service categories retrieved successfully",
      categories,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve service categories",
      error: error.message,
      success: false,
    });
  }
});

// SERVICES >>>>
server.post("/admin/add-service", adminAuth, async (req, res) => {
  try {
    const {
      serviceName,
      image,
      shortDescription,
      description,
      questions,
      hourlyCharge,
      serviceCategory,
    } = req.body;

    if (
      !serviceName ||
      !questions ||
      questions.length === 0 ||
      !hourlyCharge ||
      !shortDescription ||
      !description ||
      !image ||
      !serviceCategory
    ) {
      return res.status(422).json({
        message: "Please fill in all the fields",
        success: false,
      });
    }

    const newService = new Services({
      serviceName,
      description,
      questions,
      hourlyCharge,
      serviceCategory,
      image,
      shortDescription,
    });

    const savedService = await newService.save();
    res
      .status(201)
      .json({ message: "Service created successfully", service: savedService });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating service", error: error.message });
  }
});

server.get("/admin/services", adminAuth, async (req, res) => {
  try {
    const services = await Services.find().populate("serviceCategory", "name");

    res.status(200).json({
      message: "Services fetched successfully",
      services,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching services",
      error: error.message,
      success: false,
    });
  }
});

server.get("/admin/service/:id", adminAuth, async (req, res) => {
  try {
    const service = await Services.findById(req.params.id).populate(
      "serviceCategory",
      "name"
    );

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Service fetched successfully",
      service,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching service",
      error: error.message,
      success: false,
    });
  }
});

server.put("/admin/edit-service/:id", adminAuth, async (req, res) => {
  try {
    const updatedService = await Services.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({
        message: "Service not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating service",
      error: error.message,
      success: false,
    });
  }
});

server.delete("/admin/delete-service/:id", adminAuth, async (req, res) => {
  try {
    const deletedService = await Services.findByIdAndDelete(req.params.id);

    if (!deletedService) {
      return res.status(404).json({
        message: "Service not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Service deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting service",
      error: error.message,
      success: false,
    });
  }
});
// <<<< SERVICES

// ADMIN CMS >>>>>>

// Add Home CMS
server.post("/admin/home-cms", adminAuth, async (req, res) => {
  try {
    const { heading, banner, description, blogs } = req.body;

    // Build the update object based on the parameters provided
    const updateFields = {};
    if (heading !== undefined) updateFields["homePage.heading"] = heading;
    if (banner !== undefined) updateFields["homePage.banner"] = banner;
    if (heading !== undefined)
      updateFields["homePage.description"] = description;
    if (blogs !== undefined) updateFields["homePage.blogs"] = blogs; // Add selected blog IDs

    // Use the upsert option to create or update the document
    const result = await CmsModel.updateOne(
      {}, // No filter to match a specific document; upsert ensures one document exists
      { $set: updateFields },
      { upsert: true } // Create the document if it doesn't exist
    );

    res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: result,
    });
  } catch (e) {
    console.error("Error updating CMS content:", e);
    res.status(500).json({
      success: false,
      message: "Failed to update content",
      error: e.message,
    });
  }
});

server.post("/admin/add-blog", adminAuth, async (req, res) => {
  try {
    const { title, shortDescription, description, slug, active, images } =
      req.body;

    const existingBlog = await BlogModel.findOne({ slug });

    if (existingBlog) {
      return res.status(400).json({
        message: "Blog of that slug already exists !",
        success: false,
      });
    }

    const newBlog = new BlogModel({
      title,
      shortDescription,
      description,
      slug,
      active,
      images,
    });

    const savedBlog = await newBlog.save();

    res.status(201).json({
      success: true,
      message: "Blog added successfully",
      data: savedBlog,
    });
  } catch (e) {
    console.error("Error adding blog:", e);
    res.status(500).json({
      success: false,
      message: "Failed to add blog",
      error: e.message,
    });
  }
});

server.put("/admin/edit-blog/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body; // Directly use request body for updating fields
    const { slug } = req.body; // Destructure slug from the request body

    // Check if the slug is being updated and if so, check for uniqueness
    if (slug) {
      const existingBlog = await BlogModel.findOne({ slug });

      // If the slug exists but it's not the same blog being updated, throw an error
      if (existingBlog && existingBlog._id.toString() !== id) {
        return res.status(400).json({
          message: "Blog with this slug already exists!",
          success: false,
        });
      }
    }

    // Proceed to update the blog
    const updatedBlog = await BlogModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true } // Returns the updated document
    );

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (e) {
    console.error("Error editing blog:", e);
    res.status(500).json({
      success: false,
      message: "Failed to edit blog",
      error: e.message,
    });
  }
});

// GET /admin/blog/:id - Fetch blog by ID
server.get("/admin/blog/:id", adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Find blog by ID
    const blog = await BlogModel.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog fetched successfully", blog });
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch blog", error: error.message });
  }
});

server.get("/blog/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find blog by ID
    const blog = await BlogModel.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog fetched successfully", blog });
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch blog", error: error.message });
  }
});

server.get("/get-blogs", async (req, res) => {
  try {
    // Find blog by ID
    const blogs = await BlogModel.find({}).limit(3);

    if (!blogs.length) {
      return res.status(404).json({ message: "Blogs not found" });
    }

    res.status(200).json({ message: "Blogs fetched successfully", blogs });
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch blog", error: error.message });
  }
});

server.delete("/admin/delete-blog/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBlog = await BlogModel.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (e) {
    console.error("Error deleting blog:", e);
    res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: e.message,
    });
  }
});

// GET /admin/blogs - Fetch blogs with optional pagination and filtering
server.get("/admin/blogs", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = {};
    // if (status === 'active') {
    //   query.active = true;
    // } else if (status === 'inactive') {
    //   query.active = false;
    // }

    // Pagination and sorting
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const blogs = await BlogModel.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));

    // Count total blogs for pagination metadata
    const totalBlogs = await BlogModel.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      data: {
        blogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalBlogs / parseInt(limit)),
          totalBlogs,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
      error: error.message,
    });
  }
});

// TESTIMONIALS >>>

// Add a new testimonial
server.post("/admin/add-testimonial", adminAuth, async (req, res) => {
  try {
    const { title, description, image } = req.body;

    const newTestimonial = new Testimonial({
      title,
      description,
      image,
    });

    await newTestimonial.save();

    res.status(201).json({
      message: "Testimonial added successfully",
      success: true,
      testimonial: newTestimonial,
    });
  } catch (error) {
    console.error("Error adding testimonial:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

// Edit a testimonial
server.put("/edit-testimonial/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, active, image } = req.body;

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      { title, description, active, image },
      { new: true } // Return the updated document
    );

    if (!updatedTestimonial) {
      return res.status(404).json({
        message: "Testimonial not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Testimonial updated successfully",
      success: true,
      testimonial: updatedTestimonial,
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

// Delete a testimonial
server.delete("/delete-testimonial/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTestimonial = await Testimonial.findByIdAndDelete(id);

    if (!deletedTestimonial) {
      return res.status(404).json({
        message: "Testimonial not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Testimonial deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

server.get("/get-testimonial/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find blog by ID
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res
      .status(200)
      .json({ message: "Testimonial fetched successfully", testimonial });
  } catch (error) {
    console.error("Error fetching testimonial by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch testimonial", error: error.message });
  }
});

// Get all testimonials
server.get("/admin/get-testimonials", async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 }); // Sort by most recent

    res.status(200).json({
      message: "Testimonials fetched successfully",
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});

server.get("/get-testimonials", async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ active: true });
    res.status(200).json({
      message: "Testimonials fetched successfully",
      success: true,
      testimonials,
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
});
// <<<< TESTIMONIALS

// PLANS API >>>

// Add a new plan
server.post("/add-plan", adminAuth, async (req, res) => {
  const errors = validatePricingPlan(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const newPlan = new PricingPlan(req.body);
    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a plan by ID
server.put("/edit-plan/:id", adminAuth, async (req, res) => {
  const errors = validatePricingPlan(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const updatedPlan = await PricingPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.status(200).json(updatedPlan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a plan by ID
server.delete("/delete-plan/:id", adminAuth, async (req, res) => {
  try {
    const deletedPlan = await PricingPlan.findByIdAndDelete(req.params.id);
    if (!deletedPlan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.status(200).json({ message: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all plans
server.get("/get-all-plans", adminAuth, async (req, res) => {
  try {
    const plans = await PricingPlan.find();
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a plan by ID
server.get("/get-plan/:id", adminAuth, async (req, res) => {
  try {
    const plan = await PricingPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }
    res.status(200).json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// <<< PLANS API

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

// CUSTOMER CMS >>>>>>
server.get("/home-cms", async (req, res) => {
  try {
    const getHomeCms = await CmsModel.findOne({})
      .select({
        _id: 0,
        homePage: 1,
      })
      .populate({
        path: "homePage.blogs", // Path to the 'blogs' field in homePage
        select: "title shortDescription images slug", // Only select these fields
      });

    return res.status(200).json({
      message: "CMS fetched",
      success: true,
      homeCMS: getHomeCms,
    });
  } catch (e) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});
// <<<<<< CUSTOMER CMS

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
      image: req.file.filename,
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

server.use(express.json());
server.get("/service", async (req, res) => {
  try {
    const services = await TaskerserviceModal.find();

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
  const updateData = req.body;

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
//     const user = await RegisterclientModal.findOne({ ema il });
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

server.get("/client/service-categories", async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ active: true });

    res.status(200).json({
      message: "Service categories retrieved successfully",
      categories,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve service categories",
      error: error.message,
      success: false,
    });
  }
});

server.get("/client/services", async (req, res) => {
  try {
    const services = await Services.find().populate("serviceCategory", "name");

    res.status(200).json({
      message: "Services fetched successfully",
      services,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching services",
      error: error.message,
      success: false,
    });
  }
});

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

server.post("/address", async (req, res) => {
  try {
    const {
      name,
      phone,
      country,
      city,
      state,
      street,
      zip,
      addressType,
      user_id,
    } = req.body;

    const existingAddresses = await AddressModal.find({ user_id });

    const isDefault = existingAddresses.length === 0;

    const newAddress = new AddressModal({
      name,
      phone,
      country,
      city,
      state,
      street,
      zip,
      addressType,
      user_id,
      default: isDefault,
    });

    const savedAddress = await newAddress.save();
    // Update the user document to include the address reference in the user's address array
    await RegisterclientModal.findByIdAndUpdate(
      user_id,
      { $push: { address: savedAddress._id } }, // Add the address to the user's address array
      { new: true }
    );
    res.status(201).json(savedAddress);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create address", details: error.message });
  }
});

server.put("/update-default-address", async (req, res) => {
  const { userId, addressId } = req.body;

  if (!userId || !addressId) {
    return res
      .status(400)
      .json({ message: "User ID and Address ID are required." });
  }

  try {
    // Set all addresses of the user to `default: false`
    await AddressModal.updateMany({ user_id: userId }, { default: false });

    // Set the specified address to `default: true`
    const updatedAddress = await AddressModal.findByIdAndUpdate(
      addressId,
      { default: true },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ message: "Address not found." });
    }

    res.status(200).json({
      message: "Default address updated successfully.",
      address: updatedAddress,
    });

    await RegisterclientModal.findByIdAndUpdate(
      userId,
      { $set: { address: updatedAddress._id } }, // You may need to set or push the updated address ID here
      { new: true }
    );
  } catch (error) {
    console.error("Error updating default address:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

server.get("/address/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const addresses = await AddressModal.find({ user_id: userId }).populate(
      "user_id",
      "name email"
    );
    res.status(200).json(addresses);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch addresses", details: error.message });
  }
});

// Get Address By ID
server.get("/address/:id", async (req, res) => {
  try {
    const address = await AddressModal.findById(req.params.id).populate(
      "user_id",
      "name email"
    );
    if (!address) return res.status(404).json({ error: "Address not found" });
    res.status(200).json(address);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch address", details: error.message });
  }
});

// Update Address
server.put("/address/:id", async (req, res) => {
  try {
    console.log(req.body);
    const updatedAddress = await AddressModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAddress)
      return res.status(404).json({ error: "Address not found" });
    res.status(200).json(updatedAddress);

    await RegisterclientModal.updateOne(
      { _id: updatedAddress.user_id },
      { $set: { address: updatedAddress._id } }
    );
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update address", details: error.message });
  }
});

// Delete Address
server.delete("/address/:id", async (req, res) => {
  try {
    const deletedAddress = await AddressModal.findByIdAndDelete(req.params.id);
    if (!deletedAddress)
      return res.status(404).json({ error: "Address not found" });
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete address", details: error.message });
  }
});
server.post("/order", async (req, res) => {
  const {
    serviceName,
    serviceCategory,
    contactDetails,
    answersList,
    timeDuration,
    vehicles,
    taskDetails,
    taskDate,
    taskTime,
    taskFrequency,
    paymentMethod,
    taskersId,
    hourlyRate,
    paymentStatus,
    totalPrice,
    userId,
    addressId,
  } = req.body;

  try {
    // Validate that the address exists and belongs to the user
    const address = await AddressModal.findOne({ _id: addressId, userId });
    if (!address) {
      return res
        .status(400)
        .send("Invalid address ID or address does not belong to the user.");
    }

    // Create the new order
    const newOrder = new OrderModel({
      serviceName,
      serviceCategory,
      contactDetails,
      answersList,
      timeDuration,
      vehicles,
      taskDetails,
      taskDate,
      taskTime,
      taskFrequency,
      paymentMethod,
      taskersId,
      hourlyRate,
      paymentStatus,
      totalPrice,
      addressId,
      userId,
    });

    // Save the order
    const savedOrder = await newOrder.save();

    // Link the order to the user's schema
    await RegisterclientModal.findByIdAndUpdate(
      userId,
      { $push: { orders: savedOrder._id } },
      { new: true }
    );

    res.status(201).send("Order created successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

server.get("/orders", async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .populate("addressId") // Populate the address details
      .populate("taskersId")
      .populate("userId");

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

server.get("/orders/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userOrders = await OrderModel.find({ userId })
      .populate("addressId") // Populate the address details
      .populate("taskersId");

    res.status(200).json(userOrders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

server.get("/order/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await OrderModel.findById(orderId)
      .populate("taskLocation") // Populate the address details
      .populate("taskersDetails"); // Populate taskers details

    if (!order) {
      return res.status(404).send("Order not found.");
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
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

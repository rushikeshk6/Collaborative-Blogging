/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
var cookieParser = require("cookie-parser");
const { User, Blog } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "my key super secret",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const saltRounds = 10;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname + "/public")));

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return done(error);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

function validateUser(req, res, done, next) {
  // validate user (user email, user pass )
  User.findOne({ where: { email: req.body.email } })
    .then(async (user) => {
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        res.cookie(`em`, user.email, {
          maxAge: 500 * 60 * 60 * 1000,
          secure: true,
          httpOnly: true,
        });
        res.cookie(`ps`, user.password, {
          maxAge: 500 * 60 * 60 * 1000,
          secure: true,
          httpOnly: true,
        });
        res.cookie(`fn`, user.firstName, {
          maxAge: 500 * 60 * 60 * 1000,
          secure: true,
          httpOnly: true,
        });
        next();
      } else {
        return done(null, false, { message: "Invalid password" });
      }
    })
    .catch((error) => {
      return next(error);
    });
}

app.get("/", async function (request, response) {
  const user = request.user;
  if (request.accepts("html")) {
    response.render("index", {
      user,
    });
  } else {
    response.json({});
  }
});

app.get("/signUp", (request, response) => {
  response.render("signup");
});

app.get("/login", (request, response) => {
  response.render("login");
});

function generateToken(user) {
  let sanitizedUser = user.toJSON();
  delete sanitizedUser["password"];

  return jwt.sign(sanitizedUser, process.env.JWT_SECRET || "your_jwt_secret");
}

//create user api endpoint

app.post("/users", async (request, response) => {
  let isAdmin = false;
  if (request.body.isAdmin != true) {
    isAdmin = true;
  }

  if (!request.body.password) {
    return response.status(400).json({ error: 'Password is required' });
  }
  const hashedpwd = await bcrypt.hash(request.body.password, saltRounds);
  console.log(hashedpwd);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      mobileNumber: request.body.mobileNumber,
      password: hashedpwd,
    });

    const token = generateToken(user);

    response.json({ user: user, token });
    console.log({ user: user + " HELLO " + token });
  } catch (error) {
    console.log(error);
  }
});

//user login api endpoint

app.post(
  "/session",
  validateUser,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    const userID = request.user.id;
    const user = request.user;
    const token = generateToken(user);
    response.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000, // Set the cookie expiration time (example: 24 hours)
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true if using HTTPS in production
    });
    response.json({ userID: userID, token });
  }
);

//user signout api endpoint

app.get("/signout", (request, response, next) => {
  request.logout((error) => {
    if (error) {
      return next(error);
    }
    request.flash("success", "You have successfully signed out.");
    response.redirect("/");
  });
});

//create blog api

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post(
  "/publisher/createBlog/:userID",
  upload.single("blogThumbnail"),
  async (req, res) => {
    try {
      // Extract user ID from the JWT token in the cookies
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ error: "Token not provided" });
      }

      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );
      const userIDFromToken = decodedToken.id;

      // Check if the authenticated user matches the requested userID
      console.log(userIDFromToken + "rank" + req.params.userID);
      console.log(typeof userIDFromToken);
      console.log(typeof req.params.userID);
      if (userIDFromToken.toString() !== req.params.userID.toString()) {
        return res
          .status(403)
          .json({ error: "Access denied. Invalid user ID." });
      }

      console.log("------------------------------------");
      console.log(req.body);

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Access the file buffer
      const thumbnailBuffer = req.file.buffer;
      const blogThumbnailBase64 = thumbnailBuffer.toString('base64');

      // Save the file to the database (assuming you have a model named Blog with a column blogThumbnail of type bytea)
      const createBlog = await Blog.create({
        blogTitle: req.body.blogTitle,
        blogThumbnail: blogThumbnailBase64, // Save the buffer directly to the database
        blogDescription: req.body.blogDescription,
        location: req.body.location,
        date: req.body.date,
        userID: userIDFromToken,
      });
      console.log(thumbnailBuffer);
      return res.json(createBlog);
    } catch (err) {
      console.log(err);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }
);

app.get("/blogs", async (req, res) => {
  try {
    // Retrieve all blogs from the database
    const allBlogs = await Blog.findAll();

    // Form a response object with the required data
    const blogsWithImages = allBlogs.map((blog) => ({
      blogTitle: blog.blogTitle,
      blogDescription: blog.blogDescription,
      location: blog.location,
      date: blog.date,
      blogThumbnail: blog.blogThumbnail
    }));
    res.json(blogsWithImages);
    res.render('blogs', { blogs: blogsWithImages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;

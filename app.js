/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
var csrf = require("csurf");
var cookieParser = require("cookie-parser");
const { User } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const cors = require("cors");
app.use(cors());
app.use(cookieParser());
app.use(csrf({ cookie: { key: 'csrfToken', httpOnly: true } }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: "my key super secret",
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

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

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  console.log("Cookies:", req.cookies); // Log cookies
  next();
});
app.use(cors({
  origin: 'http://localhost:5173/signup',
  credentials: true,
}));
function validateUser(req, res, next) {
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
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({});
  }
});

app.get("/signUp", (request, response) => {
  response.render("signup", {
    csrfToken: request.csrfToken(),
  });
});

app.get("/login", (request, response) => {
  response.render("login", {
    csrfToken: request.csrfToken(),
  });
});

app.post("/users", async (request, response) => {
  let isAdmin = false;
  if (request.body.isAdmin != true) {
    isAdmin = true;
  }
  if (request.body.firstName.length == 0) {
    request.flash("error", "First Name can not be empty!");
    return response.redirect("/signup");
  }
  if (request.body.email.length == 0) {
    request.flash("error", "Email address can not be empty!");
    return response.redirect("/signup");
  }
  if (request.body.password.length == 0) {
    request.flash("error", "Password can not be empty!");
    return response.redirect("/signup");
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
    response.locals.csrfToken = req.csrfToken();
    request.login(user, (error) => {
      if (error) {
        console.log(error);
      }
      request.flash("success", "You have signed up successfully.");
      response.redirect("/login");
    });
  } catch (error) {
    console.log(error);
  }
});

app.post(
  "/session",
  validateUser,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    const userId = request.user.id;
    request.flash("success", "You have logged in successfully.");
    if (AdminOfSport) {
      response.redirect("/admin/createSport/" + userId);
    } else {
      response.redirect("/sportList");
    }
  }
);

app.get("/signout", (request, response, next) => {
  request.logout((error) => {
    if (error) {
      return next(error);
    }
    request.flash("success", "You have successfully signed out.");
    response.redirect("/");
  });
});

module.exports = app;

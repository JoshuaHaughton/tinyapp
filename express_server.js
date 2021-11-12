//REQUIRES/INSTALLS/SET-----------------------------

const { getUserByEmail, generateRandomString, showUserOpenLinks } = require("./helpers");

const express = require("express");
const app = express();
const methodOverride = require("method-override");

const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["I like security it's the best", "key2"],
  }),
);


// ---------------------------------------------------
// BEGINNING OF DATABASES

const users = {

  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },

  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },

};

const urlDatabase = {

  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "",
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "",
  },
};


// END OF DATABASES
// ---------------------------------------------------
//BEGINNING OF ROUTES


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: showUserOpenLinks(urlDatabase, req),
  };

  if (req.session.user_id) {
    templateVars["user"] = users[req.session.user_id];
  } else {
    delete templateVars["user"];
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {

  const templateVars = {
    urls: showUserOpenLinks(urlDatabase, req),
  };

  if (req.session.user_id) {

    templateVars["user"] = users[req.session.user_id];
    res.render("urls_new", templateVars);

  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {

  const templateVars = {
    urls: showUserOpenLinks(urlDatabase, req),
  };

  if (req.session) {
    if (req.session.user_id) {
      templateVars["user"] = users[req.session.user_id];
    }
  }
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: showUserOpenLinks(urlDatabase, req),
  };
  if (req.session) {
    if (req.session.user_id) {
      templateVars["user"] = users[req.session.user_id];
    }
  }
  res.render("register", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let short = generateRandomString();
    let obj = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    urlDatabase[short] = obj;
    res.redirect(`/urls/${[short]}`);
  } else {
    const e = new Error("ERROR! You must be logged in to use this feature");
    e.status = 403;
    throw e;
  }
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!getUserByEmail(email, users)) {
    const e = new Error("ERROR 403! Email doesn't exist.");
    e.status = 403;
    throw e;
  } else {
    if (
      bcrypt.compareSync(password, getUserByEmail(email, users)["password"])
    ) {
      const id = getUserByEmail(email, users)["id"];
      req.session.user_id = id;
      res.redirect(`/urls`);
    } else {
      const e = new Error("ERROR 403! Incorrect Password");
      e.status = 403;
      throw e;
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  delete req.session.user_id;
  res.redirect(`/urls`);
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  let newID = generateRandomString();

  if (email !== "" && password !== "") {
    if (!getUserByEmail(email, users)) {
      users[newID] = {
        id: newID,
        email,
        password: hashedPassword,
      };

      req.session.user_id = newID;
      res.redirect(`/urls`);
    } else {
      const e = new Error("ERROR 400! Email already exists.");
      e.status = 400;
      throw e;
    }
  } else {
    const e = new Error("ERROR 400! Empty email or password.");
    e.status = 400;
    throw e;
  }
});

app.delete("/urls/:shortURL/delete", (req, res) => {
  if (
    req.session.user_id === urlDatabase[req.params.shortURL]["userID"] ||
    urlDatabase[req.params.shortURL]["userID"] === ""
  ) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    const e = new Error("<h2>You don't own this URL!</h2>");
    e.status = 403;
    throw e;
  }
});

app.put("/urls/:shortURL/update", (req, res) => {
  let newURL = req.body.newURL;
  urlDatabase[req.params.shortURL]["longURL"] = newURL;
  res.redirect(`/urls`);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.render("urls_show");
  }

  if (!urlDatabase[req.params.shortURL]) {
    const e = new Error("ERROR! This short URL does not exist");
    e.status = 403;
    throw e;
  }

  if (
    req.session.user_id === urlDatabase[req.params.shortURL]["userID"] ||
    urlDatabase[req.params.shortURL]["userID"] === ""
  ) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
    };

    templateVars["user"] = users[req.session.user_id];

    res.render("urls_show", templateVars);
  } else {
    const e = new Error("ERROR! You do not own this link!");
    e.status = 403;
    throw e;
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  } else {
    const e = new Error("ERROR 400! This short URL does not exist.");
    e.status = 400;
    throw e;
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

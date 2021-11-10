const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser())
const PORT = 8080; // default port 8080

function generateRandomString() {
  let out = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 1, 2, 3, 4, 5, 6, 7, 8, 9]
  let out1 = out[(Math.floor((Math.random() * 35)))]
  let out2 = out[(Math.floor((Math.random() * 35)))]
  let out3 = out[(Math.floor((Math.random() * 35)))]
  let out4 = out[(Math.floor((Math.random() * 35)))]
  let out5 = out[(Math.floor((Math.random() * 35)))]
  let out6 = out[(Math.floor((Math.random() * 35)))]
  let final = `${out1}${out2}${out3}${out4}${out5}${out6}`
  return final;
}
let user;
const alreadyExists = function (email) {
  let userObjects = Object.values(users);
  console.log('alreadyExists thrugh users: ', users);
  for (obj of userObjects) {
    if (obj['email'] === email) {
      user = obj;
      return true
    }
  }
  return false;
  }

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  if (req.cookies) {
    if (req.cookies['user_id']) {
        templateVars['user'] = users[req.cookies['user_id']];
      }
  }
  res.render('urls_index', templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  }
  console.log(req.cookies);
  if (req.cookies) {
    if (req.cookies['user_id']) {
        templateVars['user'] = users[req.cookies['user_id']];
      }
  }
  
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  }
  console.log(req.cookies);
  if (req.cookies) {
    if (req.cookies['user_id']) {
        templateVars['user'] = users[req.cookies['user_id']];
      }
  }
  
  res.render("login", templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  if (req.cookies) {
    if (req.cookies['user_id']) {
        templateVars['user'] = users[req.cookies['user_id']];
      }
  }
  res.render('register', templateVars);
})


app.post("/urls", (req, res) => {
  console.log(req.body);
  let short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${[short]}`);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  

  if (!alreadyExists(email)){
    const e = new Error("ERROR 400! Email doesn't exist.");
    e.status = 403;
    throw e;
  } else {
    if (password === user['password']) {
      const id = user['id'];
      console.log('BINGO!');
      console.log('user: ', user);
      res.cookie('user_id', id)
      res.redirect(`/urls`);
    } else {
      const e = new Error('ERROR 400! Incorrect Password');
      e.status = 403;
      throw e;

    }
    
  }

  console.log(req.body);
  
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  console.log(req.body);
  let email = req.body.email;
  let password = req.body.password;
  let newID = generateRandomString();

  if (email !== '' && password !== '') {
    if (!alreadyExists(email)) {

    users[newID] = {
        id: newID,
        email,
        password
      }

      res.cookie('user_id', newID)
      console.log(users);
      res.redirect(`/urls`);

    } else {
      const e = new Error('ERROR 400! Email already exists.');
      e.status = 400;
      throw e;
    }
  } else {
    const e = new Error('ERROR 400! Empty email or password.');
    e.status = 400;
    throw e;
  }
  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/update", (req, res) => {
  let newURL = req.body.newURL;
  urlDatabase[req.params.shortURL] = newURL;
  res.redirect(`/urls`);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
};

if (req.cookies) {
  if (req.cookies['user_id']) {
      templateVars['user'] = users[req.cookies['user_id']];
    }
}
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
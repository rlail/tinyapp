const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

function generateRandomString() {
  let randomString = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: users[req.cookies.user_id].email,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("Short URL not found");
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongUrl = req.body.longURL;
  urlDatabase[id] = newLongUrl;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Email and password cannot be empty");
    return;
  }
  const user = getUserByEmail(email);
  if (user) {
    res.status(400).send("Email already registered");
    return;
  }

  const userId = generateRandomString();
  users[userId] = { id: userId, email, password };
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = Object.values(users).find(user => user.email === email && user.password === password);
  if (user) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(401).send("Invalid credentials");
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found");
  }
});

function getUserByEmail(email) {
  return Object.values(users).find(user => user.email === email);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
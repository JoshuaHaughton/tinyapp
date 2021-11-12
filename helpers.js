//When given an email and a database to search, finds and returns the user object with the matching email address
const getUserByEmail = function (email, users) {
  let userObjects = Object.values(users);
  for (obj of userObjects) {
    if (obj["email"] === email) {
      return obj;
    }
  }
  return undefined;
};

//Generates and returns a random 6-digit alphanumeric string
function generateRandomString() {
  let out = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 1, 2, 3, 4, 5, 6, 7, 8, 9]

  let final = "";
  for (i = 0; i < 6; i++) {
    final += out[Math.floor(Math.random() * 35)];
  }
  return final;
}

//Returns a object containing the longURLs that the user is authorized to view
const showUserOpenLinks = (urlDatabase, req) => {
  let out = {};

  for (key in urlDatabase) {

    if (urlDatabase[key]["userID"] === req.session.user_id) {
      out[key] = urlDatabase[key]["longURL"];
    }
  }
  return out;
};

module.exports = { getUserByEmail, generateRandomString, showUserOpenLinks };

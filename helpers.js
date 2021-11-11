const getUsersByEmail = function (email, users) {
  let userObjects = Object.values(users);
  console.log('alreadyExists thrugh users: ', users);
  for (obj of userObjects) {
    if (obj['email'] === email) {
      user = obj;
      console.log(user);
      return obj
    }
  }
  return false;
  }

  module.exports = { getUsersByEmail }
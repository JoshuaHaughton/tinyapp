const getUserByEmail = function (email, users) {
  let userObjects = Object.values(users);
  console.log('alreadyExists thrugh users: ', users);
  for (obj of userObjects) {
    if (obj['email'] === email) {
      return obj
    }
  }
  return undefined;
  }

  module.exports = { getUserByEmail }
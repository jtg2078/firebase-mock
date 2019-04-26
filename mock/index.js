const { firestore, adminAuth } = require("./firebase");
const { algolia } = require("./algolia");
const AppService = require("./app");

module.exports = {
  firestore,
  adminAuth,
  algolia,
  AppService
};

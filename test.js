const mongoose = require("mongoose");

const MONGO_URI = "PASTE_URI_YANG_SAMA_DENGAN_COMPASS";

mongoose.connect(MONGO_URI, {
  family: 4,
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log("CONNECTED SUCCESS");
})
.catch((err) => {
  console.log("ERROR:");
  console.log(err);
});
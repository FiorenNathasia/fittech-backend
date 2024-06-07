const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const apiRoutes = require("./routes/auth.js");

dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const publicDirectory = path.join(__dirname, "public");
app.use(express.static(publicDirectory));

app.use("/api", apiRoutes);

app.listen(8081, () => {
  console.log("Server started on PORT 8081");
});

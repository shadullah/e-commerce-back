// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

app.get("/", (req, res) => {
  res.send("welcome to lazz pharma backend");
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongodb connection failed", err);
  });

/*
import express from "express";

const app = express()(
  // function connectDB() {}

  // connectDB()

  async () => {
    try {
      await mongooose.connect(`${process.env.MONGODB_URI}/${dbName}`);
      app.on("error", (err) => {
        console.log("error", err);
        throw err;
      });

      app.listen(process.env.PORT, () => {
        console.log(`app is listening to ${process.env.PORT}`);
      });
    } catch (err) {
      console.log("error", err);
      throw err;
    }
  }
)();

*/

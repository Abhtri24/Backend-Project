console.log("Starting the application...");

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from './app.js';  // Import the app instance from app.js

dotenv.config({ path: './.env' });

connectDB()
  .then(() => {
    // Listen on the port here in index.js
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB CONNECTION FAILED!!!", err);
  });

import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js"; // Assuming controller is separate
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

// Debugging log when route is set
console.log("Initializing user routes...");

// Define route for registration
router.route("/register").post( 
    upload.fields([
        {
            name: "avatar", maxCount: 1
        },
        {
            name: "cover", maxCount: 1
        }
    ]),
    registerUser); // Use the controller to handle the logic

// Debugging log when route is initialized
console.log("User routes initialized: /register");

export default router;

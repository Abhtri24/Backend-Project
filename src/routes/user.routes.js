import { Router } from "express";
import { registerUser , logoutUser,loginUser,refAccessToken} from "../controllers/user.controller.js"; // Assuming controller is separate
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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


router.route("/login").post(loginUser)


//secured routes
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refAccessToken)

export default router;

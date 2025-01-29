import { Router } from "express";
import { registerUser , logoutUser,loginUser,refAccessToken,changeCurrentPassword, getCurrentUser, updateUser, updateAvatar, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js"; // Assuming controller is separate
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
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateUser)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)


router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)

export default router;

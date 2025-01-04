import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiRes.js";

const registerUser = asyncHandler(async (req, res) => {

  const {fullName,username,email,password} =req.body
  console.log("email",email)



if(
    [fullName,username,email,password].some((field)=>field?.trim()==="empty")
){
    throw new ApiError(400,"All fields are required")
}
existingUser = User.findOne({
    $or:[{email},{username}]
})
if(existingUser){
    throw new ApiError(409,"User already exists with email or username")
}
  const AvatarlocalPath= req.files?.avatar[0]?.path;
  const CoverImageLocal= req.files?.cover[0]?.path;

  if(!AvatarlocalPath){
      throw new ApiError(400,"Avatar is required")
  }
 const avatar = await uploadCloudinary(AvatarlocalPath);
 const coverImage = await uploadCloudinary(CoverImageLocal);

if(!avatar){
    throw new ApiError(500,"Avatar upload failed")
}
  const user  = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()

})

const createdUser = await User.findById(user._id).select("-password -refreshToken")

if(!createdUser){
    throw new ApiError(500,"User registration failed")
 
}

retrun res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
)


})




export { registerUser };

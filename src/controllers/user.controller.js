import { asyncHandler } from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
 // get user detail from frontend

  const {fullName,username,email,password} =req.body
  console.log("email",email)
 // validation 

//  if (fullName==="empty"){
//     throw new ApiError(400,"Fullname is required")
//  }


if(
    [fullName,username,email,password].some((field)=>field?.trim()==="empty")
){
    throw new ApiError(400,"All fields are required")
}
 // check user already exists
existingUser = User.findOne({
    $or:[{email},{username}]
})
if(existingUser){
    throw new ApiError(409,"User already exists with email or username")

 // check for images
  const AvatarlocalPath= req.files?.Avatar[0]?.path;
  constCoverImageLocal= req.files?.Cover[0]?.path;

  if()
 // upload to cloudinary,check if avatar uploaded
 // create user object -- .create in db
 //remove password and token from response
 // check user created or not
 // return response 
});

export { registerUser };

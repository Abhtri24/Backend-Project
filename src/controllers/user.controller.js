import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiRes.js";


const generateAccandRefToken = async(userId)=>{
    try {
       const user =  await User.findById(userId)
        const accToken =  user.generateAccessToken()
       const refToken =  user.generateRefreshToken()

       user.refreshToken = refToken
      await user.save({validateBeforeSave:false})

      return {accToken,refToken}
        
    } 

    catch (error) {
        throw new ApiError(500,"Token generation failed")
    }
}

const registerUser = asyncHandler(async (req, res) => {

  const {fullName,username,email,password} =req.body
  console.log("email",email)



if(
    [fullName,username,email,password].some((field)=>field?.trim()==="empty")
){
    throw new ApiError(400,"All fields are required")
}
 const existingUser = await User.findOne({
    $or:[{email},{username}]
})
if(existingUser){
    throw new ApiError(409,"User already exists with email or username")
}
console.log(req.files)
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

return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
)


})

const loginUser = asyncHandler(async (req, res) => {
    const {email,username,password} = req.body
    if(!username || !email){
        throw new ApiError(400,"Username or email is required")
    }
    
   const user =  await User.findOne({
        $or : [{email},{username}]
    })

    if(!user){
        throw new ApiError(404,"User doesnt exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid Password")
    }

 const {accToken , refToken} =   await generateAccandRefToken(user._id)

 const options = {
    httpOnly : true,
    secure : true,
 }
 return res.status(200)
 .cookie("accesToken",accToken,options)
 .cookie("refreshToken",refToken,options)
 .json(
    new ApiResponse(
        200,
        {
            user : accToken,refToken
        },
        "User logged in successfully"
    )
 )



})

const logoutUser =  asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                refreshToken:undefined 
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true,
       
    }
    return res.status(200).clearCookie("accesToken",options)
    .clearCookie(refreshToken,options)
    .json(new ApiResponse(200,{},"User logged out"))
    
})


export { registerUser,
    loginUser,logoutUser
 };

import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiRes.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


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
    if(!username && !email){
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
            $unset:{
                refreshToken: 1
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
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
    
})

const refAccessToken = asyncHandler(async (req, res) => {
  const incomingRefToken =   req.cookies.refreshToken||req.body.refreshToken

  if(!incomingRefToken){
      throw new ApiError(401,"Unauthorized")
  }

  try {
    const decodedToken =  jwt.verify(
      incomingRefToken,process.env.REFRESH_TOKEN_SECRET
    )
    const user =  await User.findById(decodedToken?._id)
  
    if(!user){
        throw new ApiError(404,"invalid ref token")
    }
  
    if(incomingRefToken!==user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used")
  
    }
  
    const options = {
      httpOnly : true,
      secure : true
    }
    const {accToken,newrefToken} = await generateAccandRefToken(user._id) 
   
   return res
   .status(200)
   .cookie("accesToken",accToken,options)
   .cookie("refreshToken",newrefToken,options)
   .json(
      new ApiResponse(
          200,
          {accToken,refToken: newrefToken},
          "Access token refreshed successfully"
      )
   )
  } catch (error) {
    throw new ApiError(401,error?.message||"Unauthorized")
    
  }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{

    const {oldPassword,newPassword} = req.body

  const user = await User.findById(req.user?._id) 
   const isPasswordcorr = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordcorr){
    throw new ApiError(400,"Invalid Old Password")
   }

   user.password = newPassword

  await  user.save({validateBeforeSave:false})

  return res.status(200)
  .json(new ApiResponse(200),{},"Password Changed successfully")

})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"Current user fetched successfully")
})

const updateUser = asyncHandler(async(req,res)=>{

    const {fullName,email} = req.body
    if (!fullName||!email) {
        throw new ApiError(400,"All fields are empty ")
        
    }

     const user = User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Account details updated")
    )
})

const updateAvatar = asyncHandler(async(req,res)=>{

   const AvatarlocalPath =  req.file?.path

   if(!AvatarlocalPath){
    throw new ApiError(400,"Avatar missing")
   }
   const avatar = await uploadCloudinary(AvatarlocalPath)
   if (!avatar.url) {
    throw new ApiError(400,"error while uploading avatar")
   }
    const user = await User.findByIdAndUpdate(
    req.user?._id,
    {$set:
        {
            avatar:avatar.url
        }
    },
    {new:true}
   ).select("-password")

   return res.status(200)
   .json(
    new ApiResponse(200,user,"avatar updated")
   )
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params
    if (!username?.trim) {
        throw new ApiError(400,"Username is missing")
        
    }

    const channel = await  User.aggregate([
        {
            $match:{
                username :username.toLowerCase()
            }
            
        },
        {
            $lookup:{
                from : "subscriptions",
                localField: "_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from : "subscriptions",
                localField: "_id",
                foreignField:"subscriber",
                as:"subscribedTo"

            }
        },
        {
            $addFields :{
                subscribersCount : {
                    $size : "$subscribers"

                },
                channelsSubscribedTo : {
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond: {
                        if: {$in:[req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else : false
                        }
                    }

                }
            } ,
            {
                $project:{
                    fullName : 1,
                    userName : 1,
                    subscribersCount:1,
                    channelsSubscribedTo:1,
                    isSubscribed :1,
                    avatar:1,
                    coverImage :1,
                    email : 1




                }

            }

        
    ])


    if(!channel?.length){
        throw new ApiError(404,"channel does not exist")
        
    }
    return res.status(200)
    .json(
        new ApiRes(200,channel[0],"User Channel fetched successfully")
    )

})

const getWatchHistory = asyncHandler(async(req,res)=>{
 const user = await User.aggregate([
    {
        $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },{
    $lookup:{ 
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as:"WatchHistory",

        pipeline:[
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as: "owner",

                    pipeline:[
                        {
                            $project:{
                                fullName: 1,
                                userName:1,
                                avatar:1
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    owner:{
                        $first : "$owner"
                    }
                }
            }
        ]
    }
}

 ])
 return res.status(200)
 .json(
    new ApiResponse(200,user[0].watchHistory,"watch history fetched")
 )
})

export { registerUser,getUserChannelProfile,getWatchHistory,
    loginUser,logoutUser,refAccessToken,getCurrentUser,changeCurrentPassword,updateUser,updateAvatar
 };

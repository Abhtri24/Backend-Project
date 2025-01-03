import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



const UserSchema = new Schema(
    {
        userName : {type: String, required: true,unique: true,lowercase: true,trim: true,index: true},
        email :{
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        FullName :{
            type: String,
            required: true,
            trim: true,
            index : true
        },
        Avatar :{
            type: String, // cloud url
            required: true,
            
        },
        Cover :{
            type: String,
           
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref : "Video"
            }


        ],
        password : {
            type: String,
            required: [true, 'Password is required'],
        },
        refreshToken : {

        },

        
            timestamps: true
        }

    
)

UserSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

UserSchema.methods.isPasswordCorrect = async function(password) {
   return  await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateACCESSTOKEN = function(){
     return jwt.sign(
        {
            _id: this._id,
            email : this.email,
            userName : this.userName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
UserSchema.methods.generateREFRESHTOKEN = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
} 




export const User =  mongoose.model('User', UserSchema);

import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema(
    {
        videofile : {type: String, required: true,},
        thumbnail :{
            type: String,
            required: true,
           
        },
        Title :{
            type: String,
            required: true,
            
        },
        Description :{
            type: String, // cloud url
            required: true,
            
        },
        time :{
            type: Number,
            required: true,
           
        },
       
        views: {
            type: Number,
            required: true,
            default : 0 
        },
        isPublished: {
            type: Boolean,
            required: true,
            default : true

        },
        owner:{
            type: Schema.Types.ObjectId,
            ref : 'User'
        },

        
            timestamps: true
        }

    
)
VideoSchema.plugin(mongooseAggregatePaginate)
export const Video =  mongoose.model('Video', VideoSchema);

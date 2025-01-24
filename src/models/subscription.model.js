import mongoose, {Schema} from "mongoose"

const subSchema = new Schema({
    subscriber:{
        typeof: Schema.Types.ObjectId,
        ref : "User"
    },

    channel : {
        typeof: Schema.Types.ObjectId,
        ref : "User"
    }
},{timestamps:true}
)

export const Subscription = mongoose.model("Subscription",subSchema)
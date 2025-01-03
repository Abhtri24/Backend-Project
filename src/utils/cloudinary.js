import {v2 as cloudinary} from "cloudinary";
import { log } from "console";
import fs from "fs";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadONcloudinary = async (filepath) => {
    try {
        if(!filepath) return null; 
      const response = await  cloudinary.uploader.upload(filepath,{
            resource_type : "auto",


        })
        console.log("File uploaded to cloudinary",response.url);
        return response;

    } catch (error) {
        fs.unlinkSync(filepath); // delete the file from the local server as the upload failed
        retun null;


        
    }
}

export default UploadONcloudinary;
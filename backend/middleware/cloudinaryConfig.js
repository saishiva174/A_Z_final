import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// 1. Connect to your Cloudinary Account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Profile Picture Logic: Square crop, face detection
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'atoz_project/profiles',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] 
  }
});

// 3. Work Evidence Logic: High quality, original aspect ratio
const workStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'atoz_project/work_evidences',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 1200, crop: 'limit' }] 
  }
});

// 4. Document Logic: Supports PDFs, no cropping (must stay readable)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'atoz_project/documents',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'], 
    transformation: [{ quality: "auto" }] 
  }
});


// Create the specific upload middlewares
const uploadProfile = multer({ storage: profileStorage });
const uploadWork = multer({ storage: workStorage });
const uploadDoc = multer({ storage: documentStorage });


const deleteFromCloudinary = async (url) => {
    try {
        if (!url) return;
        
        // Example URL: https://res.cloudinary.com/cloudname/image/upload/v123/folder/imagename.jpg
        // We need: folder/imagename
        const parts = url.split('/');
        const fileNameWithExtension = parts.pop(); // imagename.jpg
        const folderName = parts.pop(); // folder
        const publicId = `${folderName}/${fileNameWithExtension.split('.')[0]}`;
        
        // If your folder is deeper (e.g., atoz_project/profiles), use:
        // const publicId = `atoz_project/profiles/${fileNameWithExtension.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
       
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
    }
};
export { uploadProfile, uploadWork, uploadDoc,deleteFromCloudinary};
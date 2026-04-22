import cloudinary from '../src/config/cloudinary';

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("Config Name:", cloudinary.config().cloud_name);

if (cloudinary.config().cloud_name) {
    console.log("✅ Cloudinary Config Loaded Successfully");
} else {
    console.log("❌ Cloudinary Config Failed to Load");
}

process.exit(0);

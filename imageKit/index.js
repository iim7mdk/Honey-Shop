
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ImageKit = require('imagekit');

// إعداد مكتبة ImageKit بمفاتيح من .env
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// إعداد multer لتخزين مؤقت للصور في مجلد "uploads/"
const upload = multer({ dest: 'uploads/' });

// دالة لرفع الصورة إلى ImageKit
const uploadToImageKit = async (file) => {
    const uploaded = await imagekit.upload({
        file: fs.readFileSync(file.path),   // الملف المؤقت
        fileName: file.originalname,
        folder: 'perfume-shop'                  // اسم المجلد في ImageKit (اختياري)
    });

    
    // حذف الملف المؤقت بعد نجاح الرفع
    fs.unlink(file.path, (err) => {
        if (err) console.error('❌ خطأ في حذف الملف:', err);
        else console.log('🗑️ تم حذف الملف المؤقت:', file.path);
    });


    return {
        url: uploaded.url,
        name: uploaded.name,
        fileId: uploaded.fileId
    };


};

module.exports = {
    imagekit,
    upload,             // middleware multer
    uploadToImageKit    // دالة الرفع
};

const path = require('path');
const imagekit = require('../config/imagekit');

const uploadToImagekit = async (file, folder) => {
    if (!file) return null;

    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    const fileName = `${baseName}-${Date.now()}${ext}`;

    const uploaded = await imagekit.upload({
        file: file.buffer,
        fileName,
        folder,
        useUniqueFileName: false,
    });

    return {
        fileName: uploaded.name,
        filePath: uploaded.filePath,
        url: uploaded.url,
    };
};

module.exports = uploadToImagekit;

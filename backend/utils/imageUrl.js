const getCustomerProfileImageUrl = (filePath) => {
    if (!filePath) return null;
    return `${process.env.IMAGEKIT_URL_ENDPOINT}${filePath}`;
};

const getCategoryImageUrl = (filePath) => {
    if (!filePath) return null;
    return `${process.env.IMAGEKIT_URL_ENDPOINT}${filePath}`;
};

const getImagekitUrl = (filePath) => {
    if (!filePath) return null;
    return `${process.env.IMAGEKIT_URL_ENDPOINT}${filePath}`;
};

module.exports = {
    getCustomerProfileImageUrl,
    getCategoryImageUrl,
    getImagekitUrl,
};
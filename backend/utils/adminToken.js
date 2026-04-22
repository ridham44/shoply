const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/auth');

exports.generateAdminToken = (admin) => {
    return jwt.sign(
        {
            id: admin._id,
            name: admin.name,
            phone: admin.phone,
            role: admin.role,
        },
        jwtConfig.accessTokenSecret,
        {
            expiresIn: jwtConfig.accessTokenExpiry,
        },
    );
};
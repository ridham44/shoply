const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/auth');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id || user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        },
        jwtConfig.accessTokenSecret,
        {
            expiresIn: jwtConfig.accessTokenExpiry,
        },
    );
};

module.exports = { generateToken };
const bcrypt = require('bcryptjs');

const User = require('../models/User.model');
const status = require('../utils/statusCodes');
const uploadToImagekit = require('../utils/uploadToImagekit');
const { getCustomerProfileImageUrl } = require('../utils/imageUrl');
const { generateToken } = require('../utils/jwt');

const formatUser = (user) => {
    const userObj = user.toObject ? user.toObject() : user;

    delete userObj.password;

    return {
        ...userObj,
        profileImage: getCustomerProfileImageUrl(userObj.profileImage),
    };
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, gender } = req.body;

        if (!name || !email || !password || !phone || !gender) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'All fields are required',
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { phone }],
        });

        if (existingUser) {
            return res.status(status.Conflict).json({
                success: false,
                message: 'Email or phone already exists',
            });
        }

        let profileImage = '';

        if (req.file) {
            const imageData = await uploadToImagekit(req.file, '/customers');
            profileImage = imageData.filePath;
        }

        //const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password,
            phone,
            gender,
            profileImage,
        });

        const token = generateToken(user);

        return res.status(status.CREATED).json({
            success: true,
            message: 'Registration successful',
            token,
            data: formatUser(user),
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Identifier and password are required',
            });
        }

        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase().trim() },
                { phone: identifier.trim() },
            ],
            deletedAt: null,
        });

        if (!user) {
            return res.status(status.Unauthorized).json({
                success: false,
                message: 'Invalid credentials - user not found',
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(status.Unauthorized).json({
                success: false,
                message: 'Invalid credentials - password not match',
            });
        }

        const token = generateToken(user);

        return res.status(status.OK).json({
            success: true,
            message: 'Login successful',
            token,
            data: formatUser(user),
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Customer profile fetched successfully',
            data: formatUser(user),
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;

        const updateData = { ...req.body };

        if (req.file) {
            const imageData = await uploadToImagekit(req.file, '/customers');
            updateData.profileImage = imageData.filePath;
        }

        delete updateData.password;
        delete updateData.role;

        const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).select('-password');

        if (!user) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer not found',
            });
        }

        return res.status(status.OK).json({
            success: true,
            message: 'Profile updated successfully',
            data: formatUser(user),
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(status.BadRequest).json({
                success: false,
                message: 'Old password and new password are required',
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(status.NotFound).json({
                success: false,
                message: 'Customer not found',
            });
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordMatch) {
            return res.status(status.Unauthorized).json({
                success: false,
                message: 'Old password is incorrect',
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(status.OK).json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error) {
        return res.status(status.InternalServerError).json({
            success: false,
            message: error.message,
        });
    }
};

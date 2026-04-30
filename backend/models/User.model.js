const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true,
        },

        profileImage: {
            type: String,
            default: '',
        },

        role: {
            type: String,
            enum: ['user', 'customer'],
            default: 'customer',
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },

        updatedAt: {
            type: Date,
            default: Date.now,
        },

        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        versionKey: false,
    },
);

userSchema.pre('save', async function (next) {
    this.updatedAt = new Date();

    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

userSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

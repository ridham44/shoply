const mongoose = require('mongoose');

const customerReviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        customerName: {
            type: String,
            default: '',
            trim: true,
        },

        customerPhone: {
            type: String,
            default: '',
            trim: true,
        },

        customerEmail: {
            type: String,
            default: '',
            trim: true,
        },

        customerProfileImage: {
            type: String,
            default: '',
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        review: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
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

customerReviewSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

customerReviewSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

module.exports = mongoose.models.CustomerReview || mongoose.model('CustomerReview', customerReviewSchema);

const { required } = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'First Name is required'],
        trim: true,
        minlength: [2, 'First Name must be at least 2 characters long'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email must be unique'],
        trim: true,
        minlength: [5, 'Email length must be at least 5'],
        lowercase: true,
        
    },
    password: {
        type: String,
        required:[ true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false, // ensures that password is not included in the data that will be retrieved when queried
        trim: true,
    },
    // region: {
    //     type: String,
    //     select: false
    // },
    phoneNumber: {
        type: String,
        select: false
    },
    school: {
        type: String,
        select: false
    },
    
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);

module.exports = User
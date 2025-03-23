
const mongoose = require('mongoose');

const submitFormSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    firstName:{
        type: String,
        required: true
    },
    surName:{
        type: String,
        required: true
    },
    otherName: {
        type: String,
        default: 'None'
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email must be unique'],
        trim: true,
        minlength: [5, 'Email length must be at least 5'],
        lowercase: true,        
    },
    phoneNumber: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    region:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    resumePath: {
        type: String,
        required: true
    },
    resumeName: {
        type: String,
        required: true
    },
    transcriptPath: {
        type: String,
        required: true
    },
    transcriptName: {
        type: String,
        required: true
    },
    internshipLetterPath: {
        type: String,
        required: true
    },
    internshipLetterName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    
     

},{
    timestamps: true
})

const SubmitForm = mongoose.model('SubmitForm', submitFormSchema);
module.exports = SubmitForm;

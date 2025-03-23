// const numericCodeGeneration = require('../../utils/numericCode');
// const transport = require('../../utils/sendMail');
// const User = require('../models/users.models');

// // change password

// exports.sendForgotPassword = async (req, res) => {
//     try {
//         const {email} = req.body;

//         const existingUser = await User.findOne({email});
//         if(!existingUser){
//             return res.status(404).json({success: false, message: 'User cannot be found'});
//         }

//         const forgotPasswordCode = numericCodeGeneration();
//         const htmlContent = 
//         `
//         `;
//         let info = await transport.sendMail({
//             from: process.env.EMAIL_USER,
//             to: existingUser.email,
//             subject: '🔑 Password Reset code'
//         })
        
//     } catch (error) {
//         console.log(error)
//     }
// }
const User = require('../models/users.models');
const bcrypt = require('bcryptjs')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const numericCodeGeneration = require('../../utils/numericCode');
const transport = require('../../utils/sendMail');
const { hmacProcess } = require('../../utils/hmac');

exports.signup = async (req, res) => {
    const {fullName, email, password, confirmPassword} = req.body;

    try {
        if(!fullName || !email || !password || !confirmPassword){
            return res.status(400).json({success: false, message: 'All fields are required'});
        }
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(401).json({success: false, message: 'User already exists'});
        }

        if(password !== confirmPassword){
            return res.status(401).json({success: false, message: 'Passwords must be the same'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword

        })

        const result = await newUser.save();
        res.status(201).json({success: true, message: 'Your account has been created successfully', result})
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message: 'Internal server error', error: error.message})
    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({success: false, message: 'All fields are required'});
        }

        const existingUser = await User.findOne({email}).select('+password');
        if(!existingUser){
            return res.status(401).json({success: false, message: 'User does not exist'});
        }

        //compare password
        const comparePassword = await bcrypt.compare(password, existingUser.password);

        if (!comparePassword){
           return res.status(401).json({success: false, message: 'Invalid password'});
        }

        const payload = {
            id: existingUser._id,
            email: existingUser.email
        }

        const SIX_HRS_IN_MS = 6 * 3600 * 1000;
        const expiresAfterSixHrs = new Date(Date.now() + SIX_HRS_IN_MS);
        const token = jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: '6h' });

        return res.status(200).cookie('Authorization', `Bearer ${token}`, {
            expires: expiresAfterSixHrs,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/'
        }).json({success: true, message: 'login successful', token})
        

    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: 'Internal server error', error: error.message})
    }
}

exports.sendForgotPasswordCode = async (req, res) => {
    try {
        const {email} = req.body;

        const existingUser = await User.findOne({email});
        if(!existingUser){
            return res.status(404).json({success: false, message: 'User cannot be found'});
        }

        const existingUserFirstName = (existingUser.fullName || ' ').split(" ")[0]?.trim() || " ";

        const forgotPasswordCode = numericCodeGeneration();

        const htmlContent = 
        `<p>Hi ${existingUserFirstName},</p> 
        <p>We received a request to reset your password. Here\'s the code you\'ll need to continue:</p>
        <h1>${forgotPasswordCode} </h1> 
        <p>Please note that this code will expire in 30 mins. If you didn\'t ask to reset your password, feel free to disregard this message or reach out to us right away.</p> 
        <p>Best regards,
        <br>The WorkHive Crew</p>
        `;

        let info = await transport.sendMail({
            from: process.env.EMAIL_USER,
            to: existingUser.email,
            subject: '🔑 Password Reset code',
            html: htmlContent
        })

        if(info.response && info.response.includes('OK')){
            const hashedCode = hmacProcess(forgotPasswordCode, process.env.HMAC_SECRET_CODE);
            existingUser.forgotPasswordCode = hashedCode;
            const THIRTY_MINS_IN_MS = 30 * 60 * 1000;
            existingUser.forgotPasswordCodeValidation = Date.now() + THIRTY_MINS_IN_MS;
            await existingUser.save()

            return res.status(200).json({success: true, message: 'Forgot password code sent'});

        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Error sending forgot password code: ' + error.message});
    }
}

exports.verifyResetPasswordCode = async (req, res) => {
    try {
        const {email, forgotPasswordCode, newPassword} = req.body;

        const existingUser = await User.findOne({email}).select('+forgotPasswordCode +forgotPasswordCodeValidation');

        if(!existingUser){
            return res.status(404).json({success: false, message: 'User cannot be found'});
        }

        if(!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation){
            return res.status(401).json({success: false, message: 'Forgot password code is not right'});
        }

        if(Date.now() > existingUser.forgotPasswordCodeValidation){
            return res.status(401).json({success: false, message: 'Forgot password code has expired'});
        }

        const hashedCode = hmacProcess(forgotPasswordCode, process.env.HMAC_SECRET_CODE);

        if (hashedCode === existingUser.forgotPasswordCode){
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;

            //hash newPassword
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            existingUser.password = hashedPassword

            await existingUser.save();
            return res.status(200).json({success: true, message: 'Your code is valid and your password has been updated'})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Error changing password: ' + error.message});
    }
}
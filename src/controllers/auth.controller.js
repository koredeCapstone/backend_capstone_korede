const User = require('../models/users.models');
const bcrypt = require('bcryptjs')
require('dotenv').config();
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const {fullName, email, password} = req.body;

    try {
        if(!fullName || !email || !password){
            return res.status(400).json({success: false, message: 'All fields are required'});
        }
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(401).json({success: false, message: 'User already exists'});
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
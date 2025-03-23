const User = require('../models/users.models');
const upload = require('../middlewares/upload');
const SubmitForm = require('../models/letter.models');
const transport = require('../../utils/sendMail');

exports.uploadData = async (req, res) => {
    // using the multer middleware to upload the file

    upload(req, res, async(err) => {
        if(err){
            return res.status(400).json({success: false, message: err.message})
        }

        try {
            const existingUser = await User.findById(req.user.id).select('+phoneNumber +school');
            if(!existingUser){
                return res.status(404).json({success: false, message: 'User not found'});
            }
            
            // Get phoneNumber and school from the request body (form-data)
            const firstName = req.body.firstName;
            const surname = req.body.surname;
            const otherName = req.body.otherName;
            const email = req.body.email;
            if(email !== existingUser.email){
                return res.status(400).json({success: false, message: 'Email does not match the email used in registration'})
            }
            const phoneNumber = req.body.phoneNumber;
            const degree = req.body.degree;
            const country = req.body.country;
            const region = req.body.region;
            const city = req.body.city;
            

            //checking for empty fields
            const missingFields = [];
            if(!firstName) missingFields.push('firstName');
            if(!surname) missingFields.push('surname');
            if(!email) missingFields.push('email');
            if(!phoneNumber) missingFields.push('phoneNumber');
            if(!degree) missingFields.push('degree');
            if(!country) missingFields.push('country');
            if(!region) missingFields.push('region');
            if(!city) missingFields.push('city');


            if(missingFields.length > 0){
                return res.status(400).json({success: false, message: 'Please fill all the empty fields ', missingFields})
            }

            // check for an existing submission
            const existingSubmission = await SubmitForm.findOne({userId: req.user.id});
            if(existingSubmission){
                return res.status(400).json({success: false, message: 'Multiple submissions is not allowed'})
            }

            // Check if the files were uploaded
            if (!req.files || !req.files['resume'] || req.files['resume'].length === 0) {
                return res.status(400).json({ success: false, message: 'Resume file has been uploaded' });
            }
            if (!req.files || !req.files['transcript'] || req.files['transcript'].length === 0) {
                return res.status(400).json({ success: false, message: 'Transcript file has been uploaded' });
            }
            if (!req.files || !req.files['internshipLetter'] || req.files['internshipLetter'].length === 0) {
                return res.status(400).json({ success: false, message: 'Internship letter file has been uploaded' });
            }


            const resume = req.files['resume'][0];
            const transcript = req.files['transcript'][0];
            const internshipLetter = req.files['internshipLetter'][0];

            const submittedForm = new SubmitForm({
                userId: req.user.id,
                firstName: firstName,
                surName: surname,
                otherName: otherName,
                email: email,
                phoneNumber: phoneNumber,
                degree: degree,
                country: country,
                region: region,
                city: city,
                resumePath: resume.path,
                resumeName: resume.originalname,
                transcriptPath: transcript.path,
                transcriptName: transcript.originalname,
                internshipLetterPath: internshipLetter.path,
                internshipLetterName: internshipLetter.originalname,
              

            })

            await submittedForm.save();

            const htmlContent = `
            <p>Hello ${firstName},</p>
            <p>We\'re excited to confirm that your form has been submitted successfully!</p>
            <h1>Great Job! 🎉</h1>
            <p>Your submission is now being processed. We\'ll get back to you soon with the next steps.</p>
            <p>If you have any questions or didn\'t submit this form, please contact us</p>
            <p>Thanks,<br>The WorkHive Team</p>
            `;
            
            

            // send mail when form has been sent successfully
            let emailSent = true;
            try {
                const info = await transport.sendMail({
                    from: `[The WorkHive Team] <${process.env.EMAIL_USER}>`,
                    to: existingUser.email,
                    subject: '✅ Form submitted',
                    html: htmlContent
                });
    
                if(!(info.response && info.response.includes('OK'))){
                    console.error(`Failed sending mail to ${existingUser.email}: ${info.response}`);
                    emailSent = false;
                }
                
            } catch (emailError) {
                console.error(`Failed sending mail to ${existingUser.email}`);
                emailSent = false
            }
            

            return res.status(201).json({
                success: true, 
                message: emailSent ? 'Letter uploaded successfully. A confirmation email has been sent to your email address ' 
                : 'Letter uploaded successfully, but we couldn\'t send a confirmation email.', 
                letterId: submittedForm._id})

        } catch (error) {
            if (error.name === 'MongoServerError' && error.code === 11000) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'You have already submitted a form. Multiple submissions are not allowed.' 
                });
            }
            console.log(error);
            return res.status(500).json({success: false, message: 'Internal server error', error: error.message})
        }
    } )
}
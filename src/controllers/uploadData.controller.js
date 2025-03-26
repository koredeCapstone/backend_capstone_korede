const User = require("../models/users.models");
const upload = require("../middlewares/upload");
const SubmitForm = require("../models/letter.models");
const transport = require("../../utils/sendMail");

exports.uploadData = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      // Extract form data
      const firstName = req.body.firstName;
      const surname = req.body.surname;
      const otherName = req.body.otherName;
      const email = req.body.email;
      const phoneNumber = req.body.phoneNumber;
      const degree = req.body.degree;
      const country = req.body.country;
      const region = req.body.region;
      const city = req.body.city;

      // Check for missing fields
      const missingFields = [];
      if (!firstName) missingFields.push("firstName");
      if (!surname) missingFields.push("surname");
      if (!email) missingFields.push("email");
      if (!phoneNumber) missingFields.push("phoneNumber");
      if (!degree) missingFields.push("degree");
      if (!country) missingFields.push("country");
      if (!region) missingFields.push("region");
      if (!city) missingFields.push("city");

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Please fill all the required fields",
          missingFields,
        });
      }

      // Check for an existing submission based on email
      const existingSubmission = await SubmitForm.findOne({ email });
      if (existingSubmission) {
        return res.status(400).json({
          success: false,
          message: "An application with this email has already been submitted. Multiple submissions are not allowed.",
        });
      }

      // Check if the files were uploaded
      if (!req.files || !req.files["resume"] || req.files["resume"].length === 0) {
        return res.status(400).json({ success: false, message: "Resume file is required" });
      }
      if (!req.files || !req.files["transcript"] || req.files["transcript"].length === 0) {
        return res.status(400).json({ success: false, message: "Transcript file is required" });
      }
      if (!req.files || !req.files["internshipLetter"] || req.files["internshipLetter"].length === 0) {
        return res.status(400).json({ success: false, message: "Internship letter file is required" });
      }

      const resume = req.files["resume"][0];
      const transcript = req.files["transcript"][0];
      const internshipLetter = req.files["internshipLetter"][0];

      // Optionally get userId if the user is logged in
      let userId = null;
      if (req.user && req.user.id) {
        const existingUser = await User.findById(req.user.id);
        if (existingUser) {
          userId = req.user.id;
        }
      }

      // Save the submission
      const submittedForm = new SubmitForm({
        userId, // Will be null if user is not logged in
        firstName,
        surName: surname, // Note: Fix typo in model if needed (should be `surname`)
        otherName,
        email,
        phoneNumber,
        degree,
        country,
        region,
        city,
        resumePath: resume.path,
        resumeName: resume.originalname,
        transcriptPath: transcript.path,
        transcriptName: transcript.originalname,
        internshipLetterPath: internshipLetter.path,
        internshipLetterName: internshipLetter.originalname,
      });

      await submittedForm.save();

      // Send confirmation email
      const htmlContent = `
        <p>Hello ${firstName},</p>
        <p>We're excited to confirm that your form has been submitted successfully!</p>
        <h1>Great Job! 🎉</h1>
        <p>Your submission is now being processed. We'll get back to you soon with the next steps.</p>
        <p>If you have any questions or didn't submit this form, please contact us</p>
        <p>Thanks,<br>The WorkHive Team</p>
      `;

      let emailSent = true;
      try {
        const info = await transport.sendMail({
          from: `[The WorkHive Team] <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "✅ Form submitted",
          html: htmlContent,
        });

        if (!(info.response && info.response.includes("OK"))) {
          console.error(`Failed sending mail to ${email}: ${info.response}`);
          emailSent = false;
        }
      } catch (emailError) {
        console.error(`Failed sending mail to ${email}:`, emailError);
        emailSent = false;
      }

      return res.status(201).json({
        success: true,
        message: emailSent
          ? "Application submitted successfully. A confirmation email has been sent to your email address."
          : "Application submitted successfully, but we couldn't send a confirmation email.",
        letterId: submittedForm._id,
      });
    } catch (error) {
      console.error("Backend error:", error);
      if (error.name === "MongoServerError" && error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "An application with this email has already been submitted. Multiple submissions are not allowed.",
        });
      }
      return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  });
};
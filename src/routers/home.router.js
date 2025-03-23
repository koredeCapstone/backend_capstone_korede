const express = require('express');
const router = express.Router();


router.get('/home', (req, res) => {
    res.status(200).json({success: true, message: 'Welcome home'});
});

module.exports = router;
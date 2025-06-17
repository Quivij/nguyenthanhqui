const express = require('express');
const router = express.Router();
const { loginWithGoogle } = require('../controllers/userController');

// Google OAuth login
router.post('/google', loginWithGoogle);

// Facebook OAuth login
router.post('/facebook', (req, res) => {
  // Facebook login implementation
});

module.exports = router; 
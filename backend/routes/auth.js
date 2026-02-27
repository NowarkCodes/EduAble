const express = require('express');
const { register, login, ngoRegister, ngoLogin } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/ngo-register', ngoRegister);
router.post('/ngo-login', ngoLogin);

module.exports = router;

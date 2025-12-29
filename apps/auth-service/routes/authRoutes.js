const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, createUser, getAllUsers, updateUser, deleteUser } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// User Management (Admin Only)
router.post('/create-user', createUser);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;

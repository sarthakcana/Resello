const router = require('express').Router();
const userController = require('../controllers/user.controller');

// USERS ROUTES
router.post('/create', userController.createUser);
router.get('/get_users/', userController.getUsers);
router.get('/get_users/:id', userController.getUsers);
router.delete('/delete_user/:id', userController.deleteUser);
// router.delete('/get_detail/:id', userController.deleteUser);

module.exports = [router];
const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, updateUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

// GET all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
   res.status(500).json({ error: 'Internal server error',message:err.detail});
  }
});

// CREATE new user
router.post('/',[
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ], async (req, res) => {

     const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashed]
    );
    res.status(201).send('User created');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error',message:err.detail});
  }
});

// UPDATE user
router.put('/:id',[
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
  ], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

  try {
    const { name, email } = req.body;
    const query =await pool.query(
      'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [name, email, req.params.id]);
    
      if (query.rows.length > 0) {
        res.status(200).json({message:'User updated'});
      }
       else {
            res.status(404).json({ error: 'User not found' });
        }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error',message:err.detail});
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length > 0) {
      res.json({ message: 'Deleted successfully', user: result.rows[0] });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', message: err.detail });
  }
});


// CHANGE PASSWORD
router.put('/changepassword/:id', [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { oldPassword, newPassword } = req.body;
  const userId = req.params.id;

  try {
    // Get current hashed password from DB
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentHashedPassword = result.rows[0].password;

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // Hash new password and update
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHashedPassword, userId]
    );
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ error: 'Internal server error',message:err.detail});
  }
});

module.exports = router;

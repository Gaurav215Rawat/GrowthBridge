const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { body, validationResult } = require('express-validator');
const authorization = require('../middleware/authMiddleware');

// GET all contacts
// GET contacts with optional status filter
router.get('/',authorization, async (req, res) => {
  const { status } = req.query;

  try {
    let query = 'SELECT * FROM contact';
    let values = [];

    if (status) {
      query += ' WHERE status = $1';
      values.push(status);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error',message:err.detail});
  }
});


// CREATE contact
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('Bussiness_Name').notEmpty().withMessage('Business Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phon_no').notEmpty().withMessage('Phone number is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('status').optional().isIn(['new', 'in_progress', 'resolved']).withMessage('Invalid status')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, Bussiness_Name, email, phon_no, location, status = 'new' } = req.body;
      await pool.query(
        `INSERT INTO contact (name, Bussiness_Name, email, phon_no, location, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [name, Bussiness_Name, email, phon_no, location, status]
      );
      res.status(201).send('Contact added');
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error',message:err.detail});
    }
  }
);

// UPDATE contact status
router.put('/:id/status',authorization, [
  body('status').isIn(['new', 'in_progress', 'resolved']).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status } = req.body;
    const { id } = req.params;
    const result = await pool.query('UPDATE contact SET status = $1 WHERE id = $2', [status, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).send('Contact status updated');
  } catch (err) {
    console.error(err);
   res.status(500).json({ error: 'Internal server error',message:err.detail});
  }
});

module.exports = router;

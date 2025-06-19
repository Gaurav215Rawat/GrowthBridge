const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// 🟢 POST - Create a new case study page
router.post('/', async (req, res) => {
  const { slug, title, content } = req.body;

  if (!slug || !content) {
    return res.status(400).json({error: 'Slug and content are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO case_study_pages (slug, title, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [slug, title, content]
    );
    res.status(201).json({message: 'Case study created.', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.', message:err.detail });
  }
});

// 🔵 GET - Get a page by slug
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id,slug,title,created_at FROM case_study_pages`);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


// 🔵 GET - Get a page by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM case_study_pages WHERE slug = $1`, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case study not found.' });
    }

    res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 🟡 PUT - Update a page by slug
router.put('/:slug', async (req, res) => {
  const { slug } = req.params;
  const { title, content } = req.body;

  if (!content) {
    return res.status(400).json({ status: 400, error: 'Content is required for update.' });
  }

  try {
    const result = await pool.query(
      `UPDATE case_study_pages
       SET title = $1, content = $2
       WHERE slug = $3
       RETURNING *`,
      [title, content, slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({  error: 'Case study not found for update.' });
    }

    res.status(200).json({ status: 200, message: 'Case study updated.', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.', message:err.detail });
  }
});

// 🔴 DELETE - Delete a page by slug
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM case_study_pages WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 404, error: 'Case study not found for deletion.' });
    }

    res.status(200).json({
      status: 200,
      message: 'Case study deleted successfully.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.',message:err.detail });
  }
});

module.exports = router;

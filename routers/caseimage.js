const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');
const uploadHomepageImage = require('../middleware/banner'); // path to your multer config


router.post('/:case_id', uploadHomepageImage.single('image'), async (req, res) => {
  const { case_id } = req.params;
  const { ref } = req.body;
  const imageFile = req.file;

  if (!ref || !imageFile) {
    return res.status(400).json({ error: 'ref, type, and image are required' });
  }

  const imagePath = `/uploads/${case_id}/${imageFile.filename}`;

  try {
    const result = await pool.query(
      `INSERT INTO caseimages (case_id, ref, image_path)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [case_id, ref, imagePath]
    );

    res.status(201).json({
      message: 'Image uploaded successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.get('/:case_id', async (req, res) => {
  const { case_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, ref, image_path, created_at FROM caseimages WHERE case_id = $1`,
      [case_id]
    );

    res.json({
      message: 'Images fetched successfully',
      data: result.rows,
    });
  } catch (err) {
    console.error('Fetch images error:', err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id} = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM caseimages
       WHERE id = $1 
       RETURNING image_path`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imagePath = result.rows[0].image_path;
    const absolutePath = path.join(__dirname, '..', imagePath);

    fs.unlink(absolutePath, (err) => {
      if (err) {
        console.warn(`⚠️ Could not delete image file: ${err.message}`);
      }
    });

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});


router.put('/:case_id', uploadHomepageImage.single('image'), async (req, res) => {
  const { case_id } = req.params;
    const { ref } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM caseimages WHERE case_id = $1 AND ref = $2',
      [case_id, ref]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image record not found.' });
    }

    const oldImage = result.rows[0];
    const newFileExt = path.extname(imageFile.originalname).toLowerCase();
    const oldFileExt = path.extname(oldImage.image_path || '').toLowerCase();

    // Delete old image file if extensions are different
    if (oldImage.image_path && newFileExt !== oldFileExt) {
      const oldImagePathOnDisk = path.join(__dirname, '..', '..', oldImage.image_path);
      fs.unlink(oldImagePathOnDisk, (err) => {
        if (err) console.warn(`⚠️ Could not delete old image: ${err.message}`);
      });
    }

    // New image path
    const imagePath = `/uploads/${case_id}/${imageFile.filename}`;

    // Update DB
    const updateResult = await client.query(
      `UPDATE caseimages SET image_path = $1 WHERE case_id = $2 AND ref = $3 RETURNING *`,
      [imagePath, case_id, ref]
    );

    res.json({
      message: 'Image updated successfully',
      data: updateResult.rows[0],
    });

  } catch (error) {
    console.error('Image update error:', error);
    res.status(500).json({ error: 'Failed to update image' });
  } finally {
    client.release();
  }
});

module.exports=router;
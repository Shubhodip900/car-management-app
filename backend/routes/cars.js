const express = require('express');
const path = require('path');
const fs = require('fs');
const Car = require('../models/Car');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024
  }
});

// Add a new car with images (stored as binary data in database)

/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Car management routes
 */

/**
 * @swagger
 * /api/cars:
 *   post:
 *     summary: Add a new car with images
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Successfully added car
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
 */

router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    // Convert the uploaded files into binary (Buffer)
    const imageBuffers = req.files.map(file => file.buffer); 

    // Create a new car with the uploaded images and user
    const car = new Car({
      ...req.body,
      images: imageBuffers, // Store images as binary data (Buffer)
      user: req.user.id
    });

    await car.save();
    res.json(car); // Return the created car object
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Get all cars for the logged-in user with search
/**
 * @swagger
 * /api/cars:
 *   get:
 *     summary: Get all cars for the logged-in user with optional search functionality
 *     tags: [Cars]
 *     parameters:
 *       - name: keyword
 *         in: query
 *         description: Keyword to search cars by title, description, or tags (car_type, company, dealer)
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched all cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                   tags:
 *                     type: object
 *       500:
 *         description: Server error
 */

router.get('/', auth, async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const query = {
      user: req.user.id,
      $or: [
        { title: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') },
        { 'tags.car_type': new RegExp(keyword, 'i') },
        { 'tags.company': new RegExp(keyword, 'i') },
        { 'tags.dealer': new RegExp(keyword, 'i') },
      ],
    };
    const cars = await Car.find(query);
    res.json(cars);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get a single car by ID and retrieve image data as a base64 encoded string

/**
 * @swagger
 * /api/cars/{id}:
 *   get:
 *     summary: Get a single car by ID with images
 *     tags: [Cars]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the car to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched car details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Car not found
 *       500:
 *         description: Server error
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ msg: 'Car not found' });

    // Convert binary image data to base64 for frontend use
    const carWithImagesBase64 = {
      ...car.toObject(),
      images: car.images.map(imageBuffer => imageBuffer.toString('base64')) // Convert each image buffer to a base64 string
    };

    res.json(carWithImagesBase64); // Send the car data with base64 images
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// // Update a car with images handling
/**
 * @swagger
 * /api/cars/{id}:
 *   put:
 *     summary: Update a car by ID with new images and details
 *     tags: [Cars]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the car to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: object
 *               existing_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: base64
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Successfully updated car details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Car not found
 *       500:
 *         description: Server error
 */

router.put('/:id', auth, upload.array('images'), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const parsedTags = JSON.parse(tags); // Parse the tags JSON string

    // Fetch the car based on user ID and car ID
    const car = await Car.findOne({ _id: req.params.id, user: req.user.id });
    if (!car) return res.status(404).json({ msg: 'Car not found' });

    // Update title, description, and tags
    car.title = title;
    car.description = description;
    car.tags = parsedTags;

    // Handle images
    const newImages = req.files.map((file) => file.buffer); // Keep as Buffer
    const existingImages = req.body.existing_images 
      ? (Array.isArray(req.body.existing_images) 
          ? req.body.existing_images 
          : [req.body.existing_images]) 
      : [];

    // Combine new and existing images
    car.images = [...existingImages.map(base64 => Buffer.from(base64, 'base64')), ...newImages];

    
    await car.save();

    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


// Delete a car
/**
 * @swagger
 * /api/cars/{id}:
 *   delete:
 *     summary: Delete a car by ID
 *     tags: [Cars]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the car to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted car
 *       404:
 *         description: Car not found
 *       500:
 *         description: Server error
 */

router.delete('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!car) return res.status(404).json({ msg: 'Car not found' });
    res.json({ msg: 'Car deleted' });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
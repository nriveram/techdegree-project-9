'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { User, Course } = require('./models');
const { authenticateUser } = require('./middleware/auth-user');
const auth = require('basic-auth');
const bcrypt = require('bcrypt');

// Construct a router instance.
const router = express.Router();

router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
    //const credentials = auth(req);
    //const user = await User.findOne({ where: {emailAddress: credentials.name} });
    //const users = await User.findAll();
    res.status(200).json(user);
}));

// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
    try {
    
        const user = await User.create(req.body);
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        user.password = hashedPassword; 

        res.status(201).location('/').end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
      }
    }
  }));

// Route that retrieves all courses and Users associated 
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        include: [
            {
                model: User, 
                as: 'student'
            }
        ],
    });
    res.status(200).json(courses);
}));

// Route that returns the corresponding course and User associated 
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findOne({ 
        where: 
            {
                id: req.params.id
            }, 
        include: [
            {
                model: User, 
                as: 'student'
            }
        ] 
    });
    res.status(200).json(course);
}));

// Route that creates a new course 
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).location(`/courses/${course.id}`).end();
    } catch(error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
        }
    }
}));

// Route that updates corresponding course 
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    let course; 
    try {
        course = await Course.findByPk(req.params.id); 
        if (course) {
            await course.update(req.body);
            res.status(204).end();
        } else {
            res.sendStatus(404); 
        }
    } catch(error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
        }
    }
    
}));

// Route that deletes correspondig course
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    let course; 
    try {
        course = await Course.findByPk(req.params.id); 
        if (course) {
            await course.destroy();
            res.status(204).end();
        } else {
            res.sendStatus(404); 
        }
    } catch(error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
        }
    }
}));  

module.exports = router;
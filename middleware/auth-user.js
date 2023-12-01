'use strict';
const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Middleware to authenticate the request using Basic Authentication.
exports.authenticateUser = async (req, res, next) => {
    let message; 

    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req); 

    // If the user's credentials are available...
    if (credentials) {
        // Attempt to retrieve the user from the data store
        // by their username (i.e. the user's "key"
        // from the Authorization header).
        const user = await User.findOne({ where: {emailAddress: credentials.name} });
        // If a user was successfully retrieved from the data store...
        if (user) {
            // Use the bcrypt npm package to compare the user's password
            // (from the Authorization header) to the user's password
            // that was retrieved from the data store.
            const authenticated = bcrypt
                .compareSync(credentials.pass, user.confirmedPassword);
            // If the passwords match...
            if (authenticated) {
                // Store the retrieved user object on the request object
                // so any middleware functions that follow this middleware function
                // will have access to the user's information.
                console.log(`Authentication successful for user: ${credentials.name}`);
                req.currentUser = user; 

            } else {
                message = `Authentication failure for user: ${credentials.name}`;
            }
        } else {
            message = `User not found for email: ${credentials.name}`;
        }
    } else {
        message = 'Auth header not found';
    }
    // If user authentication failed...
    if (message) {
        // Return a response with a 401 Unauthorized HTTP status code.
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
        
    // Or if user authentication succeeded...
    } else {
        // Call the next() method.
        next();

    }
   
}
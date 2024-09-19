const jwt = require('jsonwebtoken');
const User = require('../models/users'); // Import the User model

module.exports = async(req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);

        // Find the user by ID decoded from the token and attach to req.user
        const user = await User.findById(decoded.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'ZZZ User not found' });
        }
        console.log(user);

        req.user = user; // Attach the user object to req.user
        next(); // Call the next middleware or route handler
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};
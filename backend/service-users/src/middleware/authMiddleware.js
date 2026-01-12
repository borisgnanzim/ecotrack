const jwt = require('jsonwebtoken');
const secret_key = process.env.JWT_SECRET || 'your_secret_key';

const authMiddleware = (req, res, next) => {
//   const token = req.header('Authorization');
//   if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(" ")[1]; // "Bearer xxx"


    try {
        const decoded = jwt.verify(token, secret_key);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};
module.exports = authMiddleware;
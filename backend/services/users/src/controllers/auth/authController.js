const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const secret_key = process.env.JWT_SECRET || 'your_secret_key';
const notificationService = require('../../services/notificationService');
// login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }
        // Générer un token JWT (à implémenter)
        const token = jwt.sign({ id: user.id, role: user.role }, secret_key, { expiresIn: '1h' });

        res.status(200).json({ token, message: 'Logged in successfully', user_role: user.role, user_id: user.id, username: user.username });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// register citizen
exports.registerCitizen = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.create({ username, email, password });

        // send welcome notification asynchronously (best-effort)
        notificationService.sendWelcomeNotification(user).catch(err => console.error('Welcome notification failed:', err.message || err));

        const token = jwt.sign({ id: user.id, role: user.role }, secret_key, { expiresIn: '1h' });
        res.status(201).json({ message: 'Citizen registered successfully', user, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
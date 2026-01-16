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
        // Générer un token JWT avec les rôles
        const roleNames = user.roles.map(r => r.name);
        const token = jwt.sign({ id: user.id, roles: roleNames }, secret_key, { expiresIn: '1h' });

        res.status(200).json({ token, message: 'Logged in successfully', user_roles: roleNames, user_id: user.id, username: user.username });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// register citizen
exports.registerCitizen = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        console.log('On a ceci : ', username)
        const user = await User.create({ username, email, password });
        
        // Assigner le rôle "citizen" par défaut
        const { prisma } = require('../../config/postgres');
        const citizenRole = await prisma.role.findUnique({ where: { name: 'citizen' } });
        if (citizenRole) {
          await prisma.user.update({
            where: { id: user.id },
            data: { roles: { connect: { id: citizenRole.id } } }
          });
        }

        // Récupérer l'utilisateur avec ses rôles
        const userWithRoles = await User.findById(user.id);
        const roleNames = userWithRoles.roles.map(r => r.name);

        // send welcome notification asynchronously (best-effort)
        notificationService.sendWelcomeNotification(userWithRoles).catch(err => console.error('Welcome notification failed:', err.message || err));

        const token = jwt.sign({ id: userWithRoles.id, roles: roleNames }, secret_key, { expiresIn: '1h' });
        res.status(201).json({ message: 'Citizen registered successfully', user: userWithRoles, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
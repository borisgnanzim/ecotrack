const jwt = require("jsonwebtoken");
const User = require("../../models/User");

exports.getProfile = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(" ")[1]; // "Bearer xxx"
    try {
        const decoder = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoder.id);
        if(!user) {
            return res.status(404).json({message: 'Utilisateur non trouvé'});
        }
        const host = req.get('host');
        const protocol = req.protocol;
        const avatarPath = user.avatar ? `${protocol}://${host}${user.avatar}` : `${protocol}://${host}/uploads/defaults/default_avatar.svg`;
        const profileData = {
            name: user.name,
            address: user.address,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: avatarPath
        };
        res.status(200).json({ user: profileData, message: "User Profile returned successfully" })

    } catch(err) {
        res.status(401).json({ message: 'Invalid token', error: err.message });
    }

}

exports.updateProfile = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(" ")[1]; // "Bearer xxx"
    try {
        const decoder = jwt.verify(token, process.env.JWT_SECRET);
        const user = User.findById(decoder.id);
        if(!user) {
            return res.status(404).json({message: 'Utilisateur non trouvé'});
        } 
        const name = req.body.name || user.name;
        const address = req.body.address || user.address;
        const username = req.body.username || user.username;

        const updatedUser = await User.findByIdAndUpdate(decoder.id, { name, address, username }, { new: true });
        res.status(200).json({ user: updatedUser, message: 'Profile updated successfully' });

    } catch(err) {
        res.status(401).json({ message: 'Invalid token' });
    }
}
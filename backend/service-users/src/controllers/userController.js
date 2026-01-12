const User = require('../models/User');

// get users

exports.getAllUsers = async (req, res, next) => {
    try {
       const users =  await User.find();
        res.status(200).json(users);
    } catch (error){
        res.status(500).json({message: error.message});
    }
}

// get user by id
exports.getUserById = async (req, res, next) => {
    try {
       const user =  await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({message: 'Utilisateur non trouvé'});
        }
        res.status(200).json(user);
    } catch (error){
        res.status(500).json({message: error.message});
    }
};

// update user
exports.updateUser = async (req, res, next) => {
    try {
        let user = await User.findById(req.params.id);
        if(!user) {
            return  res.status(404).json({message: 'Utilisateur non trouvé'});
        }
        user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.status(200).json(user);

    } catch (error){
        res.status(500).json({message: error.message});
    }
};

// delete user

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json({message: 'Utilisateur non trouvé'});
        }
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({message: 'Utilisateur supprimé'});
    } catch (error){
        res.status(500).json({message: error.message});
    }
};

exports.getProfile = async (req, res, next) => {

}
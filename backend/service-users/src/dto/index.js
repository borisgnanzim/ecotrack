// Auth DTOs
const LoginDTO = require('./auth/LoginDTO');
const RegisterDTO = require('./auth/RegisterDTO');

// User DTOs
const UpdateUserDTO = require('./user/UpdateUserDTO');
const CreateUserDTO = require('./user/CreateUserDTO');

// Profile DTOs
const GetProfileDTO = require('./profile/GetProfileDTO');
const UpdateProfileDTO = require('./profile/UpdateProfileDTO');

// Notification DTOs
const CreateNotificationDTO = require('./notification/CreateNotificationDTO');

// Utilities
const Validator = require('./Validator');
const ValidationError = require('./ValidationError');

module.exports = {
  // Auth
  LoginDTO,
  RegisterDTO,
  
  // User
  UpdateUserDTO,
  CreateUserDTO,
  
  // Profile
  GetProfileDTO,
  UpdateProfileDTO,
  
  // Notification
  CreateNotificationDTO,
  
  // Utilities
  Validator,
  ValidationError
};

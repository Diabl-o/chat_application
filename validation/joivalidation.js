import Joi from "joi";
const passwordPattern = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"
);

const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": `Full Name must be a type of string`,
    "string.empty": `Full Name cannot be an empty field`,
    "any.required": `Full Name is a required field`,
  }),
  username: Joi.string().alphanum().min(4).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordPattern).min(8).required().messages({
    "string.pattern.base": `Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character`,
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const otpVerifySchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

// Profile validation schema
const profileSchema = Joi.object({
  userId: Joi.string().required(),
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  oldpassword: Joi.string().required(),
  newpassword: Joi.string().min(6).required(),
});

// Update user validation schema
const updateUserSchema = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().optional(),
  phone: Joi.string().optional(),
  about: Joi.string().optional(),
  profile_pic: Joi.string().uri().optional(),
});

// Search user validation schema
const searchUserSchema = Joi.object({
  search: Joi.string().required(),
});

// Create room validation schema
const createRoomSchema = Joi.object({
  room_name: Joi.string().required(),
  roomUsers: Joi.array().items(Joi.string().required()).required(),
});

// Add user to room validation schema
const addUserSchema = Joi.object({
  roomId: Joi.string().required(),
  roomUsers: Joi.array().items(Joi.string().required()).required(),
});

// Remove user from room validation schema
const removeUserSchema = Joi.object({
  roomId: Joi.string().required(),
  userId: Joi.string().required(),
});

// Update room validation schema
const updateRoomSchema = Joi.object({
  roomId: Joi.string().required(),
  roomName: Joi.string().optional(),
  adminUser: Joi.string().optional(),
});

export {
  registerSchema,
  loginSchema,
  otpVerifySchema,
  profileSchema,
  changePasswordSchema,
  updateUserSchema,
  searchUserSchema,
  createRoomSchema,
  addUserSchema,
  removeUserSchema,
  updateRoomSchema,
};

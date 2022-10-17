const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'Поле "name" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
  },

  email: {
    type: String,
    unique: true,
    required: [true, 'Поле "email" должно быть заполнено'],
    validate: {
      validator: validator.isEmail,
      message: 'Неверно заполнен email',
    },
  },

  password: {
    type: String,
    select: false,
    required: [true, 'Поле "password" должно быть заполнено'],
  },
});

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('user', userSchema);

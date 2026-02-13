const Joi = require('joi');

// Схемы валидации
const schemas = {
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(20)
      .required()
      .messages({
        'string.alphanum': 'Имя пользователя должно содержать только буквы и цифры',
        'string.min': 'Имя пользователя должно быть минимум 3 символа',
        'string.max': 'Имя пользователя должно быть максимум 20 символов',
        'any.required': 'Имя пользователя обязательно'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Введите корректный email адрес',
        'any.required': 'Email обязателен'
      }),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])'))
      .required()
      .messages({
        'string.min': 'Пароль должен быть минимум 6 символов',
        'string.pattern.base': 'Пароль должен содержать минимум одну букву и одну цифру',
        'any.required': 'Пароль обязателен'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Введите корректный email адрес',
        'any.required': 'Email обязателен'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Пароль обязателен'
      })
  })
};

// Middleware для валидации
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Показать все ошибки
      stripUnknown: true // Удалить неизвестные поля
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return res.status(400).json({
        message: 'Ошибка валидации',
        errors
      });
    }

    // Заменяем req.body на валидированные данные
    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  schemas
};

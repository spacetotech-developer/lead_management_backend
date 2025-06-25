import Joi from 'joi';
import constant from './constant.js';

const todoValidation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    dateTime: Joi.date().required(),
    // status: Joi.boolean()
  });
  console.log("<<<<>>>>>",req.body) 
  const { error } = schema.validate(req.body);

  if (error) {
    return res.json({
      status:constant.msgType.failedStatus,
      code: constant.msgCode.failureCode,
      message: error.details[0].message,
      data: ''
    });
  }

  next();
};

export default todoValidation;

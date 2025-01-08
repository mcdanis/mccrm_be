const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");
require('dotenv').config();

class Controller {
  response(res, data, code = 200) { res.status(code).json(data); }
  joi(){ return Joi }
  prisma(){ return prisma }
  bcrypt(){ return bcrypt }
  jwt(){ return jwt }
}

module.exports = Controller;

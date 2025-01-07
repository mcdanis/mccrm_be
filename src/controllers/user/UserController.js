const Controller = require("../Controller");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");
require('dotenv').config();

class UserController extends Controller {
  constructor() {
    super();
  }

  async getUsers(req, res) {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async addUser(req, res) {
    try {
      const userSchema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        client_id: Joi.number().integer().required(),
        title: Joi.string().optional(),
        role: Joi.string().required(),
      });

      const { error, value } = userSchema.validate(req.body);

      if (error) {
        res.status(400).json({ error: error.details[0].message });
      } else {
        const newPassword = await bcrypt.hash(value.password, 10);

        value.password = newPassword;

        await prisma.user.create({
          data: value,
        });

        super.response(res, {
          error: false,
          message: "a new user successfully added",
        });
      }
    } catch (error) {
      super.response(
        res,
        {
          error: true,
          message: "Failed to input data",
          detail: error,
        },
        500
      );
    }
  }

  async login(req, res) {
    const userSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const { error, value } = userSchema.validate(req.body);

    if (error) {
      return super.response(res, { error: error.details[0].message }, 400);
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          email: value.email,
        },
      });

      if (!user) {
        return super.response(res, { error: "User not found" }, 404);
      }

      const isPasswordValid = await bcrypt.compare(
        value.password,
        user.password
      );

      if (!isPasswordValid) {
        return super.response(res, { error: "Invalid Password" }, 401);
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT,
        { expiresIn: "7d" }
      );

      return super.response(res, {
        error: false,
        message: "Login successful",
        token: token
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: true,
        message: "Failed to login",
        detail: err.message,
      });
    }
  }
}

module.exports = UserController;

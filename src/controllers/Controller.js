const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");

require("dotenv").config();

class Controller {
  response(res, data, code = 200) {
    res.status(code).json(data);
  }
  joi() {
    return Joi;
  }
  prisma() {
    return prisma;
  }
  bcrypt() {
    return bcrypt;
  }
  jwt() {
    return jwt;
  }

  async getUser(userId) {
    const users = await this.prisma().user.findFirst({
      where: {
        id: Number(userId),
      },
    });
    return users;
  }

  async delete(req, res) {
    const { id, model } = req.params;
    try {
      const clientScheme = this.joi().object({
        id: this.joi().number().required(),
        model: this.joi().string().required(),
      });

      const { error } = clientScheme.validate(req.params);

      if (error) {
        return this.response(res, { error: error.details[0].message }, 400);
      } else {
        await this.prisma()[model].deleteMany({
          where: { id: Number(id) },
        });

        this.response(res, {
          error: false,
          message: "a data has been deleted",
        });
      }
    } catch (error) {
      return this.response(
        res,
        {
          error: true,
          message: "Failed deleted",
          detail: error,
        },
        500
      );
    }
  }
}

module.exports = Controller;

const Controller = require("./Controller");

class UserController extends Controller {
  constructor() {
    super();
  }

  async getUsers(req, res) {
    try {
      const users = await super.prisma().user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async getUser(req, res) {
    const { id } = req.params;

    try {
      const users = await super.prisma().user.findFirst({
        where: {
          id: Number(id),
        },
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch a user",
        detail: error.message || error,
      });
    }
  }

  async addUser(req, res) {
    try {
      const userSchema = super.joi().object({
        name: super.joi().string().min(3).required(),
        email: super.joi().string().email().required(),
        password: super.joi().string().min(6).required(),
        client_id: super.joi().number().required(),
        title: super.joi().string().optional(),
        role: super.joi().string().required(),
      });

      const { error, value } = userSchema.validate(req.body);

      if (error) {
        res.status(400).json({ error: error.details[0].message });
      } else {
        const newPassword = await super.bcrypt().hash(value.password, 10);

        value.password = newPassword;

        await super.prisma().user.create({
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
    const userSchema = super.joi().object({
      email: super.joi().string().email().required(),
      password: super.joi().string().min(6).required(),
    });

    const { error, value } = userSchema.validate(req.body);

    if (error) {
      return super.response(res, { error: error.details[0].message }, 400);
    }

    try {
      const user = await super.prisma().user.findUnique({
        where: {
          email: value.email,
        },
      });

      if (!user) {
        return super.response(res, { error: "User not found" }, 404);
      }

      const isPasswordValid = await super
        .bcrypt()
        .compare(value.password, user.password);

      if (!isPasswordValid) {
        return super.response(res, { error: "Invalid Password" }, 401);
      }

      const token = super
        .jwt()
        .sign({ userId: user.id, email: user.email }, process.env.JWT, {
          expiresIn: "7d",
        });

      return super.response(res, {
        error: false,
        message: "Login successful",
        token: token,
        userId: user.id,
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

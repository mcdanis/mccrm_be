const Controller = require("./Controller");

class ClientController extends Controller {
  constructor() {
    super();
  }

  async getClients(req, res) {
    try {
      const users = await super.prisma().client.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  }

  async addClient(req, res) {
    try {
      const clientScheme = super.joi().object({
        name: super.joi().string().min(3).required(),
        email: super.joi().string().email().required(),
        address: super.joi().string().required(),
        industry: super.joi().string().required(),
        phone_number: super.joi().string().required(),
        status: super.joi().string().required(),
      });

      const { error, value } = clientScheme.validate(req.body);

      if (error) {
        return super.response(
          res,
          { error: error.details[0].message },
          400
        );
      } else {

        await super.prisma().client.create({
          data: value,
        });

        super.response(res, {
          error: false,
          message: "a new client successfully added",
        });
      }
    } catch (error) {
      return super.response(
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
}

module.exports = ClientController;

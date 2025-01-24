const Controller = require("./Controller");

class TimelineController extends Controller {
  constructor() {
    super();
  }

  async getContactTimeline(req, res) {
    const { id } = req.params;
    try {
      const data = await super.prisma().contact_Timeline.findMany({
        where: {
          contact_id: Number(id),
        },
        orderBy: {
          id: 'desc'
        }
      });

      res.json(data);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to getting timeline", detail: error.message });
    }
  }
}
module.exports = TimelineController;

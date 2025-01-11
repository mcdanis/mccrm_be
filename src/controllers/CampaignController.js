const Controller = require("./Controller");

class CampaignController extends Controller {
  constructor() {
    super();
  }

  async getCampaigns(req, res) {
    try {
      const data = await super.prisma().campaign.findMany();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  }

  async getSubCampaign(req, res) {
    const { id } = req.params;
    try {
      const data = await super.prisma().sub_Campaign.findFirst({
        where: {
          id: Number(id),
        },
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({
        error: "Failed to get sub campaign",
        detail: error.message || error,
      });
    }
  }

  async getCampaignsWithSubs(req, res) {
    try {
      const data = await super.prisma().campaign.findMany({
        include: {
          subCampaigns: true,
        },
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  }

  async addCampaign(req, res) {
    try {
      const scheme = super.joi().object({
        campaignName: super.joi().string().required(),
        clientId: super.joi().number().required(),
        campaignStatus: super.joi().number().required(),
        subCampaignName: super.joi().string().required(),
        subCampaignOwner: super.joi().number().required(),
        subCampaignManager: super.joi().number().required(),
        subCampaignStatus: super.joi().number().required(),
        userId: super.joi().number().required(),
      });

      const { error, value } = scheme.validate(req.body);

      if (error) {
        return super.response(res, { error: error.details[0].message }, 400);
      } else {
        const campaign = await super.prisma().campaign.create({
          data: {
            name: value.campaignName,
            client_id: value.clientId,
            status: String(value.campaignStatus),
            created_by: value.userId,
          },
        });

        await super.prisma().sub_Campaign.create({
          data: {
            campaign_id: campaign.id,
            name: value.subCampaignName,
            owner: value.subCampaignOwner,
            manager: value.subCampaignManager,
            status: String(value.subCampaignStatus),
            client_id: value.clientId,
            created_by: value.userId,
          },
        });

        return super.response(res, {
          error: false,
          message: "a new campaign successfully added",
        });
      }
    } catch (error) {
      return super.response(
        res,
        {
          error: true,
          message: "Failed to input data",
          detail: error.message || error,
        },
        500
      );
    }
  }
}

module.exports = CampaignController;

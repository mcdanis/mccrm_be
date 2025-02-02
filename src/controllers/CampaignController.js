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

  async getCampaign(req, res) {
    const { id } = req.params;
    try {
      const data = await super.prisma().campaign.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          subCampaigns: true,
          user: true,
        },
      });
      res.json(data);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch campaign " + error.message });
    }
  }

  async getSubCampaign(req, res) {
    const { id } = req.params;
    try {
      const data = await super.prisma().sub_Campaign.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          campaign: true,
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

  async updateCampaign(req, res) {
    const { campaignId, campaignName, campaignStatus } = req.body;
    try {
      const data = await super.prisma().campaign.update({
        where: {
          id: Number(campaignId),
        },
        data: {
          name: campaignName,
          status: campaignStatus,
        },
      });
      res.json({
        error: false,
        message: "campaign updated!",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to update campaign",
        detail: error.message || error,
      });
    }
  }

  async getCampaignsWithSubs(req, res) {
    const { status, campaign } = req.query;
    try {
      const data = await super.prisma().campaign.findMany({
        include: {
          subCampaigns: {
            where: {
              status: String(1), // Menyaring sub-kampanye dengan status "1"
            },
          },
        },
        where: {
          ...(status ? { status: status } : {}),
          ...(campaign
            ? {
                OR: [
                  {
                    name: {
                      contains: campaign,
                      mode: "insensitive",
                    },
                  },
                  {
                    subCampaigns: {
                      some: {
                        name: {
                          contains: campaign,
                          mode: "insensitive",
                        },
                      },
                    },
                  },
                ],
              }
            : {}),
        },
      });

      res.json(data);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch campaign", detail: error.message });
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
        isCampaign: super.joi().allow(null),
      });

      const { error, value } = scheme.validate(req.body);

      if (error) {
        return super.response(res, { error: error.details[0].message }, 400);
      } else {
        let campaignId = null;
        campaignId = value.isCampaign;
        if (!value.isCampaign) {
          const campaign = await super.prisma().campaign.create({
            data: {
              name: value.campaignName,
              client_id: value.clientId,
              status: String(value.campaignStatus),
              created_by: value.userId,
            },
          });
          campaignId = campaign.id;
        }

        await super.prisma().sub_Campaign.create({
          data: {
            campaign_id: Number(campaignId),
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

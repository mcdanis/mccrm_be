const Controller = require("./Controller");

class ContactController extends Controller {
  constructor() {
    super();
  }

  async getContacts(req, res) {
    const { subCampaignId } = req.params;
    try {
      const data = await super.prisma().contact.findMany({
        where: {
          sub_campaign_id: Number(subCampaignId),
        },
      });

      res.json(data);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch contacts", detail: error.message });
    }
  }

  async getContact(req, res) {
    const { id } = req.params;
    try {
      const data = await super.prisma().contact.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          contactBant: true,
          contactActivity: true,
          contactTimeline: true,
        },
      });

      const dataCampaign = await super.prisma().sub_Campaign.findFirst({
        where: {
          id: Number(data.sub_campaign_id),
        },
        include: {
          campaign: {
            select: {
              name: true,
            },
          },
        },
      });

      res.json({ contact: data, subCampaign: dataCampaign });
    } catch (error) {
      res.status(500).json({
        error: "Failed to get sub campaign",
        detail: error.message || error,
      });
    }
  }

  async addContact(req, res) {
    try {
      const scheme = super.joi().object({
        fullName: super.joi().string().required(),
        phoneNumber: super.joi().string().required(),
        email: super.joi().string().email().required(),
        country: super.joi().string().required(),
        address: super.joi().string().required(),
        source: super.joi().string().required(),
        note: super.joi().string().required(),
        tag: super.joi().number().required(),
        contactStatus: super.joi().number().required(),
        levelPriority: super.joi().number().required(),
        subCampaignId: super.joi().number().required(),
        company: super.joi().string().required(),
      });

      const { error, value } = scheme.validate(req.body);

      if (error) {
        return super.response(res, { error: error.details[0].message }, 400);
      } else {
        const contact = await super.prisma().contact.create({
          data: {
            full_name: value.fullName,
            sub_campaign_id: value.subCampaignId,
            phone_number: value.phoneNumber,
            email: value.email,
            country: value.country,
            address: value.address,
            source: value.source,
            tag: String(value.tag),
            status: String(value.contactStatus),
            level_priority: String(value.levelPriority),
            company: String(value.company),
          },
        });

        await super.prisma().contact_Note.create({
          data: {
            sub_campaign_id: value.subCampaignId,
            contact_id: contact.id,
            note: value.note,
          },
        });

        return super.response(res, {
          error: false,
          message: "a new contact successfully added",
        });
      }
    } catch (error) {
      return super.response(
        res,
        {
          error: true,
          message: "Failed to add contact",
          detail: error.message || error,
        },
        500
      );
    }
  }
}
module.exports = ContactController;

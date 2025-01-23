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
          contactFinal: true,
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

  async addNoteQuery(subCampaignId, contactId, note, userId) {
    await super.prisma().contact_Note.create({
      data: {
        sub_campaign_id: subCampaignId,
        contact_id: contactId,
        note: note,
        user_id: Number(userId),
      },
    });
  }

  async addActivity(req, res) {
    try {
      const scheme = super.joi().object({
        contactId: super.joi().number().required(),
        description: super.joi().string().min(3).required(),
        title: super.joi().string().required(),
        userId: super.joi().number().required(),
      });

      const { error, value } = scheme.validate(req.body);

      if (error) {
        return super.response(
          res,
          { error: true, message: error.details[0].message },
          400
        );
      } else {
        const data = await super.prisma().contact_Activity.create({
          data: {
            contact_id: value.contactId,
            description: value.description,
            title: value.title,
          },
        });

        const user = await super.getUser(value.userId);
        await this.addTimeLine(
          value.contactId,
          1,
          user.name,
          `Added activity "${value.title} - ${value.description}"`
        );

        return super.response(res, {
          error: false,
          message: "an activity successfully added",
        });
      }
    } catch (error) {
      return super.response(
        res,
        {
          error: true,
          message: "Failed to add note",
          detail: error.message || error,
        },
        500
      );
    }
  }

  async addNote(req, res) {
    try {
      const scheme = super.joi().object({
        subCampaignId: super.joi().number().required(),
        contactId: super.joi().number().required(),
        note: super.joi().string().min(3).required(),
        userId: super.joi().number().required(),
      });

      const { error, value } = scheme.validate(req.body);

      if (error) {
        return super.response(
          res,
          { error: true, message: error.details[0].message },
          400
        );
      } else {
        await this.addNoteQuery(
          value.subCampaignId,
          value.contactId,
          value.note,
          value.userId
        );
        const user = await super.getUser(value.userId);
        await this.addTimeLine(
          value.contactId,
          value.subCampaignId,
          user.name,
          `Added note "${value.note}"`
        );

        return super.response(res, {
          error: false,
          message: "a note successfully added",
        });
      }
    } catch (error) {
      return super.response(
        res,
        {
          error: true,
          message: "Failed to add note",
          detail: error.message || error,
        },
        500
      );
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
        userId: super.joi().number().required(),
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

        await this.addNoteQuery(
          value.subCampaignId,
          contact.id,
          value.note,
          value.userId
        );

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

  async addTimeLine(contactId, subCampaignId, title, description) {
    try {
      await super.prisma().contact_Timeline.create({
        data: {
          contact_id: contactId,
          sub_campaign_id: subCampaignId,
          title: title,
          description: description,
        },
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async updateContact(req, res) {
    try {
      const scheme = super.joi().object({
        fullName: super.joi().string(),
        phoneNumber: super.joi().string(),
        email: super.joi().string().email(),
        company: super.joi().string(),
        country: super.joi().string(),
        address: super.joi().string(),
        source: super.joi().string(),
        note: super.joi().string().allow(null, "").optional(),
        tag: super.joi().number(),
        levelPriority: super.joi().number(),
        inputProgress: super.joi().string().allow(null, "").optional(),
        description: super.joi().string().allow(null, "").optional(),
        leadType: super.joi().number(),
        leadOwner: super.joi().number(),
        budget: super.joi().string(),
        authority: super.joi().string(),
        need: super.joi().string(),
        time: super.joi().string(),
        spesificationProject: super.joi().string(),
        nextStep: super.joi().string(),
        projectName: super.joi().string().allow(null, "").optional(),
        projectStartdate: super.joi().date().allow(null, "").optional(),
        projectEnddate: super.joi().date().allow(null, "").optional(),
        deal: super.joi().number().allow(null, "").optional(),
        resultOfNegotiation: super.joi().string().allow(null, "").optional(),
        paymentStatus: super.joi().number().allow(null, "").optional(),
        dealDone: super.joi().number().allow(null, "").optional(),
        evaluation: super.joi().string().allow(null, "").optional(),
        feedback: super.joi().string().allow(null, "").optional(),
        documentation: super.joi().string().allow(null, "").optional(),
        userId: super.joi().number(),
        status: super.joi().number(),
        contactId: super.joi().number(),
      });

      const { error, value } = scheme.validate(req.body);

      if (error) {
        return super.response(
          res,
          { error: true, message: error.details[0].message },
          400
        );
      } else {
        const contact = await super.prisma().contact.update({
          data: {
            full_name: value.fullName,
            phone_number: value.phoneNumber,
            email: value.email,
            country: value.country,
            address: value.address,
            source: value.source,
            tag: String(value.tag),
            status: String(value.status),
            level_priority: String(value.levelPriority),
            company: String(value.company),
          },
          where: { id: parseInt(value.contactId) },
        });

        // tambahkan fitur rollback tracsaction karena input banyak tabel
        // jika note ada input add note
        // input timeline dari note

        // jika progress ada input add progress
        // input timeline dari progress

        // jika ada perubahan di qualified bant maka update
        // input timeline dari qualified

        // update timeline nego

        // update timeline done

        return super.response(res, {
          error: false,
          message: "contact successfully updated",
        });
      }
    } catch (error) {
      return super.response(
        res,
        {
          error: true,
          message: "Failed to update contact",
          detail: error.message || error,
        },
        500
      );
    }
  }
}
module.exports = ContactController;

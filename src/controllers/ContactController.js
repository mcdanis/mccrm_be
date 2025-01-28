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
          `ADDED ACTIVITY "${value.title} - ${value.description}"`,
          "act"
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
          `ADDED NOTE "${value.note}"`,
          "not"
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

  async importContacts(req, res) {
    const data = req.body;
    try {
      const contact = await super.prisma().contact.createMany({
        data: data,
      });

      return super.response(res, {
        error: false,
        message: "contacts successfully imported",
      });
    } catch (error) {
      return super.response(
        res,
        {
          error: true,
          message: "Failed to import contact -> " + error?.message,
          detail: error.message || error,
        },
        500
      );
    }

    // try {
    //   const scheme = super.joi().object({
    //     subCampaignId: super.joi().number().required(),
    //     contactId: super.joi().number().required(),
    //     note: super.joi().string().min(3).required(),
    //     userId: super.joi().number().required(),
    //   });

    //   const { error, value } = scheme.validate(req.body);

    //   if (error) {
    //     return super.response(
    //       res,
    //       { error: true, message: error.details[0].message },
    //       400
    //     );
    //   } else {
    //     await this.addNoteQuery(
    //       value.subCampaignId,
    //       value.contactId,
    //       value.note,
    //       value.userId
    //     );
    //     const user = await super.getUser(value.userId);
    //     await this.addTimeLine(
    //       value.contactId,
    //       value.subCampaignId,
    //       user.name,
    //       `ADDED NOTE "${value.note}"`,
    //       "not"
    //     );

    //     return super.response(res, {
    //       error: false,
    //       message: "a note successfully added",
    //     });
    //   }
    // } catch (error) {
    //   return super.response(
    //     res,
    //     {
    //       error: true,
    //       message: "Failed to add note",
    //       detail: error.message || error,
    //     },
    //     500
    //   );
    // }
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

        const user = await super.getUser(value.userId);
        await this.addTimeLine(
          contact.id,
          value.subCampaignId,
          user.name,
          `ADDED NOTE "${value.note}"`,
          "not"
        );

        await this.addTimeLine(
          contact.id,
          value.subCampaignId,
          user.name,
          `
          CREATE CONTACT : <br>
          Full_name: <b>${value.fullName}</b> <br>
          Phone_number: <b>${value.phoneNumber}</b> <br>
          Email: <b>${value.email}</b> <br>
          Country: <b>${value.country}</b> <br>
          Address: <b>${value.address}</b> <br>
          Source: <b>${value.source}</b> <br>
          Tag: <b>${String(value.tag)}</b> <br>
          Status: <b>${String(value.contactStatus)}</b> <br>
          Level_priority: <b>${String(value.levelPriority)}</b> <br>
          Company: <b>${String(value.company)}</b> <br>
          `,
          "con"
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

  async addTimeLine(contactId, subCampaignId, title, description, type) {
    try {
      await super.prisma().contact_Timeline.create({
        data: {
          contact_id: contactId,
          sub_campaign_id: subCampaignId,
          title: title,
          description: description,
          type: type,
        },
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async searchContacts(req, res) {
    const keyword = req.query.keyword;
    const data = await super.prisma().contact.findMany({
      where: {
        full_name: {
          contains: keyword,
          mode: "insensitive",
        },
      },
      include: {
        subCampaign: true,
      },
    });
    res.json(data);
  }

  async updateContact(req, res) {
    try {
      const scheme = super.joi().object({
        fullName: super.joi().string(),
        phoneNumber: super.joi().string(),
        email: super.joi().string(),
        company: super.joi().string(),
        country: super.joi().string(),
        address: super.joi().string(),
        source: super.joi().string(),
        note: super.joi().string().allow(null, "").optional(),
        tag: super.joi().number(),
        levelPriority: super.joi().number(),
        inputProgress: super.joi().string().allow(null, "").optional(),
        description: super.joi().string().allow(null, "").optional(),
        leadType: super.joi().number().allow(null, "").optional(),
        leadOwner: super.joi().number().allow(null, "").optional(),
        budget: super.joi().string().allow(null, "").optional(),
        authority: super.joi().string().allow(null, "").optional(),
        need: super.joi().string().allow(null, "").optional(),
        time: super.joi().string().allow(null, "").optional(),
        spesificationProject: super.joi().string().allow(null, "").optional(),
        nextStep: super.joi().string().allow(null, "").optional(),
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
        subCampaignId: super.joi().number().required(),
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

        const user = await super.getUser(value.userId);
        await this.addTimeLine(
          value.contactId,
          value.subCampaignId,
          user.name,
          `
          UPDATE CONTACT : <br>
          Full_name: <b>${value.fullName}</b> <br>
          Phone_number: <b>${value.phoneNumber}</b> <br>
          Email: <b>${value.email}</b> <br>
          Country: <b>${value.country}</b> <br>
          Address: <b>${value.address}</b> <br>
          Source: <b>${value.source}</b> <br>
          Tag: <b>${String(value.tag)}</b> <br>
          Status: <b>${String(value.status)}</b> <br>
          Level_priority: <b>${String(value.levelPriority)}</b> <br>
          Company: <b>${String(value.company)}</b> <br>
          `,
          "con"
        );

        // tambahkan fitur rollback tracsaction karena input banyak tabel
        if (value.note) {
          // jika note ada input add note
          await this.addNoteQuery(
            value.subCampaignId,
            value.contactId,
            value.note,
            value.userId
          );

          // input timeline dari note
          await this.addTimeLine(
            value.contactId,
            value.subCampaignId,
            user.name,
            `ADDED NOTE "${value.note}"`,
            "not"
          );
        }

        if (value.inputProgress) {
          // jika progress ada input add progress
          const data = await super.prisma().contact_Activity.create({
            data: {
              contact_id: value.contactId,
              description: value.description,
              title: value.inputProgress,
            },
          });

          await this.addTimeLine(
            value.contactId,
            value.subCampaignId,
            user.name,
            `ADDED ACTIVITY "${value.inputProgress} - ${value.description}"`,
            "act"
          );
        }

        // jika ada perubahan di qualified bant maka update
        if (value.status >= 4 && value.status <= 8) {
          const data = await super.prisma().contact_Bant.upsert({
            where: { contact_id: value.contactId },
            update: {
              lead_type: Number(value.leadType),
              lead_owner: Number(value.leadOwner),
              budget: value.budget,
              need: value.need,
              authority: value.authority,
              time: value.time,
              spesification_project: value.spesificationProject,
              next_step: value.nextStep,
            },
            create: {
              contact_id: Number(value.contactId),
              lead_type: Number(value.leadType),
              lead_owner: value.leadOwner,
              budget: value.budget,
              need: value.need,
              authority: value.authority,
              time: value.time,
              spesification_project: value.spesificationProject,
              next_step: value.nextStep,
            },
          });

          await this.addTimeLine(
            value.contactId,
            value.subCampaignId,
            user.name,
            `
            UPDATE QUALIFICATION <br>
            Lead_type: <b>${value.leadType}</b><br>
            Lead_owner: <b>${value.leadOwner}</b><br>
            Budget: <b>${value.budget}</b><br>
            Need: <b>${value.note}</b><br>
            Authority: <b>${value.authority}</b><br>
            Time: <b>${value.time}</b><br>
            Spesification_project: <b>${value.spesificationProject}</b><br>
            Next_step: <b>${value.nextStep}</b><br>
          `,
            "qua"
          );
        }

        // update timeline nego
        if (value.status >= 5 && value.status <= 8) {
          const final = await super.prisma().contact_final.upsert({
            where: { contact_id: value.contactId },
            update: {
              project_name: value.projectName,
              start_date: String(value.projectStartdate),
              end_date: String(value.projectEnddate),
              deal: value.deal,
              result_negotiation: value.resultOfNegotiation,
            },
            create: {
              contact_id: value.contactId,
              sub_campaign_id: value.subCampaignId,
              project_name: value.projectName,
              start_date: String(value.projectStartdate),
              end_date: String(value.projectEnddate),
              deal: value.deal,
              result_negotiation: value.resultOfNegotiation,
            },
          });

          await this.addTimeLine(
            value.contactId,
            value.subCampaignId,
            user.name,
            `
            UPDATE NEGORIATION <br>
            Project_name: <b>${value.projectName} </b><br>
            Start_date: <b>${value.projectStartdate} </b><br>
            End_date: <b>${value.projectEnddate} </b><br>
            Deal: <b>${value.deal} </b><br>
            Result_negotiation: <b>${value.resultOfNegotiation} </b><br>
          `,
            "neg"
          );
        }

        if (value.status == 8) {
          const final = await super.prisma().contact_final.upsert({
            where: { contact_id: value.contactId },
            update: {
              payment_status: Number(value.paymentStatus),
              deal_done: value.dealDone,
              evaluation: value.evaluation,
              feedback: value.feedback,
              dorumentation: value.documentation,
              project_name: value.projectName,
            },
            create: {
              contact_id: value.contactId,
              sub_campaign_id: value.subCampaignId,
              payment_status: Number(value.paymentStatus),
              deal_done: value.dealDone,
              evaluation: value.evaluation,
              feedback: value.feedback,
              dorumentation: value.documentation,
              project_name: value.projectName,
            },
          });
          await this.addTimeLine(
            value.contactId,
            value.subCampaignId,
            user.name,
            `
            UPDATE DONE <br>
            Payment_status: <b>${value.paymentStatus} </b><br>
            Deal_done: <b>${value.dealDone} </b><br>
            Evaluation: <b>${value.evaluation} </b><br>
            Feedback: <b>${value.feedback} </b><br>
            Documentation: <b>${value.documentation} </b><br>
          `,
            "don"
          );
        }
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

  async duplicateContact(req, res) {
    const { id } = req.params;
    try {
      const recordsToDuplicate = await super.prisma().contact.findMany({
        where: {
          id: Number(id),
        },
      });

      const duplicatedRecords = recordsToDuplicate.map((record) => ({
        ...record,
        id: undefined,
        full_name: `${record.full_name} + copy ` + date("Y-m-d"),
      }));

      await super.prisma().contact.createMany({
        data: duplicatedRecords,
      });

      res.json({
        error: false,
        message: "data has been duplicated !",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to duplicate contact", detail: error.message });
    }
  }

  async addAsCustomer(req, res) {
    const { id, note } = req.body;
    try {
      const add = await super.prisma().customer.upsert({
        create: {
          contact_id: Number(id),
          note: note,
          tag: "",
        },
        update: { note: note, tag: "" },
        where: { contact_id: Number(id) },
      });

      res.json({
        error: false,
        message: "contact added as customer successfully!",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to adding customer ", detail: error.message });
    }
  }
}
module.exports = ContactController;

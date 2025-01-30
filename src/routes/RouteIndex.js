const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/AuthMiddleware");

const controllers = {
  UserController: require("../controllers/UserController"),
  ClientController: require("../controllers/ClientController"),
  Controller: require("../controllers/Controller"),
  CampaignController: require("../controllers/CampaignController"),
  ContactController: require("../controllers/ContactController"),
  TimelineController: require("../controllers/TimelineController"),
};

const instances = {};
for (const [name, Controller] of Object.entries(controllers)) {
  instances[name] = new Controller();
}

router.get("/test", (req, res) => instances.UserController.getUsers(req, res));

// USER
router.post("/user/add", (req, res) =>
  instances.UserController.addUser(req, res)
);
router.get("/users", (req, res) => instances.UserController.getUsers(req, res));
router.post("/login", (req, res) => instances.UserController.login(req, res));
router.get("/user/:id", authMiddleware, async (req, res) =>
  instances.UserController.getUser(req, res)
);

// CLIENT
router.get("/clients", (req, res) =>
  instances.ClientController.getClients(req, res)
);
router.post("/client/add", authMiddleware, async (req, res) =>
  instances.ClientController.addClient(req, res)
);
router.delete("/client/delete/:model/:id", authMiddleware, async (req, res) =>
  instances.Controller.delete(req, res)
);

// CAMPAIGN
router.get("/campaigns", (req, res) =>
  instances.CampaignController.getCampaigns(req, res)
);
router.get("/campaign/:id", (req, res) =>
  instances.CampaignController.getCampaign(req, res)
);
router.get("/campaigns-with-subs", (req, res) =>
  instances.CampaignController.getCampaignsWithSubs(req, res)
);
router.post("/campaign/add", authMiddleware, async (req, res) =>
  instances.CampaignController.addCampaign(req, res)
);
router.post("/campaign/update", authMiddleware, async (req, res) =>
  instances.CampaignController.updateCampaign(req, res)
);

// SUB CAMPAIGN
router.get("/sub-campaign/:id", (req, res) =>
  instances.CampaignController.getSubCampaign(req, res)
);

// CONTACT
router.post("/campaign/sub-campaign/contact", (req, res) =>
  instances.ContactController.addContact(req, res)
);
router.post("/campaign/sub-campaign/contact/note", (req, res) =>
  instances.ContactController.addNote(req, res)
);
router.post("/campaign/sub-campaign/contact/activity", (req, res) =>
  instances.ContactController.addActivity(req, res)
);
router.post("/campaign/sub-campaign/contact/update", (req, res) =>
  instances.ContactController.updateContact(req, res)
);
router.post("/campaign/sub-campaign/contact/import", (req, res) =>
  instances.ContactController.importContacts(req, res)
);
router.post("/campaign/sub-campaign/contact/duplicate/:id", (req, res) =>
  instances.ContactController.duplicateContact(req, res)
);
router.get("/campaign/sub-campaign/contacts/:subCampaignId", (req, res) =>
  instances.ContactController.getContacts(req, res)
);
router.get("/campaign/sub-campaign/contact/:id", (req, res) =>
  instances.ContactController.getContact(req, res)
);
router.get("/campaign/sub-campaign/contact/timeline/:id", (req, res) =>
  instances.TimelineController.getContactTimeline(req, res)
);
router.get("/campaign/contact/search", (req, res) =>
  instances.ContactController.searchContacts(req, res)
);
router.post("/campaign/sub-campaign/contact/move", (req, res) =>
  instances.ContactController.moveContact(req, res)
);
router.post("/campaign/sub-campaign/contact/customer", (req, res) =>
  instances.ContactController.addAsCustomer(req, res)
);

module.exports = router;

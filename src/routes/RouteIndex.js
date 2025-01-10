const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/AuthMiddleware");

const controllers = {
    UserController: require("../controllers/UserController"),
    ClientController: require("../controllers/ClientController"),
};

const instances = {};
for (const [name, Controller] of Object.entries(controllers)) {
    instances[name] = new Controller();
}

router.get("/test", (req, res) => instances.UserController.getUsers(req, res));

// USER
router.post("/user/add", (req, res) => instances.UserController.addUser(req, res));
router.get("/users", (req, res) => instances.UserController.getUsers(req, res));
router.post("/login", (req, res) => instances.UserController.login(req, res));

// CLIENT
router.get("/clients", (req, res) => instances.ClientController.getClients(req, res));
router.post("/client/add", authMiddleware, async (req, res) => instances.ClientController.addClient(req, res));

module.exports = router;

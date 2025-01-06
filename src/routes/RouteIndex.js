const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user/UserController");

const userController = new UserController();

// const auth = require("../middlewares/Auth");

// http://localhost:3001/api-user
// router.post("/login", (req, res) => userController.login(req, res));

router.get("/test", (req, res) => userController.getUsers(req, res));
router.post("/user/add", (req, res) => userController.addUser(req, res));
router.post("/user/login", (req, res) => userController.login(req, res));

// router.use(auth);

// router.delete("/sub-category/:subCategoryId", (req, res) =>
//   subCategoryController.deleteSubCategory(req, res)
// );
// router.put("/sub-category/:subCategoryId", (req, res) =>
//   subCategoryController.updateSubCategory(req, res)
// );
// router.post("/income", (req, res) => incomeController.addIncome(req, res));
// router.get("/income/:userId/:timeFrame", (req, res) =>
//   incomeController.getIncome(req, res)
// );

module.exports = router;

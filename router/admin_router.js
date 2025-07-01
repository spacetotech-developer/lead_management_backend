import express from 'express';
import * as adminController from "../contoller/admin.controller.js";
import { checkGuestAccess } from "../middleware/checkGuestAccess.js"
import { verifyJWT } from "../middleware/checkAdminAuth.js"




const router = express.Router();



router.post("/register", checkGuestAccess(), adminController.register);
router.post("/login", checkGuestAccess(), adminController.loginAdmin);
// router.post("/super/login", checkGuestAccess(), adminController.loginSuperAdmin);
router.post("/verifyOTP", checkGuestAccess(), adminController.verifyOTP);

//User Routes

router.get("/getUser", verifyJWT(), adminController.getUser);


export default router;

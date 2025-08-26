import express from 'express';
import { addLeadIndiaMartController,getLeadController,getLeadStats,getPieChartData,getChartData,addFacebookLead,verifyWebhook,getFbLeadController,addJustDialLead,addHotLead } from '../contoller/invoice.controller.js';
import { verifyPermissionToken } from '../middleware/checkPemissionAuth.js';
         
const leadRouter = express.Router();

// Router to add india mart leads data.
leadRouter.post('/leadIndiaMart',addLeadIndiaMartController);

// Router to get the india mart lead data.
leadRouter.get('/getLead',getLeadController);

leadRouter.get('/getFbLead',getFbLeadController)

// Router to get card lead state data.
leadRouter.get('/getLeadStats',getLeadStats);

// Router to get card lead state data.
leadRouter.get('/getPieChartData/:period',getPieChartData);

// Router to get card lead state data.
leadRouter.get('/getChartData',getChartData);

//Facebook Webhook Verification
leadRouter.get('/webhook/facebook',verifyWebhook);

// Router to add facebook leads
leadRouter.post('/webhook/facebook',addFacebookLead);

// Router to add Just Dial leads
leadRouter.post('/webhook/justdial',addJustDialLead);

// Router to add hot leads from EFL website
// leadRouter.post('webhook/hotlead',addHotLead);
leadRouter.post('/webhook/hotlead',addHotLead);
export default leadRouter;
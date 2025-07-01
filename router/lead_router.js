import express from 'express';
import { addLeadIndiaMartController,getLeadController,getLeadStats,getPieChartData,getChartData } from '../contoller/invoice.controller.js';
import { verifyPermissionToken } from '../middleware/checkPemissionAuth.js';
         
const leadRouter = express.Router();

// Router to add india mart leads data.
leadRouter.post('/leadIndiaMart',verifyPermissionToken(),addLeadIndiaMartController);

// Router to get the india mart lead data.
leadRouter.get('/getLead',getLeadController);

// Router to get card lead state data.
leadRouter.get('/getLeadStats',getLeadStats);

// Router to get card lead state data.
leadRouter.get('/getPieChartData/:period',getPieChartData);

// Router to get card lead state data.
leadRouter.get('/getChartData',getChartData);

export default leadRouter;
import express from 'express';
import { addLeadIndiaMartController,getLeadController,getLeadStats,getPieChartData } from '../contoller/invoice.controller.js';
         
const leadRouter = express.Router();

// Router to add india mart leads data.
leadRouter.post('/leadIndiaMart',addLeadIndiaMartController);

// Router to get the india mart lead data.
leadRouter.get('/getLead',getLeadController);

// Router to get card lead state data.
leadRouter.get('/getLeadStats',getLeadStats);

// Router to get card lead state data.
leadRouter.get('/getLeadStats/:period',getPieChartData);

export default leadRouter;
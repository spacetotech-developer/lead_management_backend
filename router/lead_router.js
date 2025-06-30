import express from 'express';
import { addLeadIndiaMartController,getLeadController,getLeadStats } from '../contoller/invoice.controller.js';
         
const leadRouter = express.Router();

// Router to add todo data.
leadRouter.post('/leadIndiaMart',addLeadIndiaMartController);

// Router to update the todo data.
leadRouter.get('/getLead',getLeadController);

// Router to update the todo data.
leadRouter.get('/getLeadStats',getLeadStats);

export default leadRouter;
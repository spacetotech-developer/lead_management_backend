import express from 'express';
import { addLeadIndiaMartController,getLeadController } from '../contoller/invoice.controller.js';
         
const leadRouter = express.Router();

// Router to add todo data.
leadRouter.post('/leadIndiaMart',addLeadIndiaMartController);

// Router to update the todo data.
leadRouter.get('/getLead',getLeadController);

export default leadRouter;
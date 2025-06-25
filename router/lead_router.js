import express from 'express';
import { addLeadIndiaMartController } from '../contoller/invoice.controller.js';
         
const invoiceRouter = express.Router();

// Router to add todo data.
invoiceRouter.post('/leadIndiaMart',addLeadIndiaMartController);

// Router to update the todo data.
// invoiceRouter.get('/getInvoice',getInvoiceController);

export default invoiceRouter;
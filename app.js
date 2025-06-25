import express from 'express';
import db from './database/databaseConfig.js';
import bodyParser from 'body-parser';
import router from './router/router.js';
import cors from 'cors';
const app = express();
const API_PORT = process.env.PORT || 8080; 

// database connection.
db();

// middle ware to parse.
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:5173https://poc-project-frontend.vercel.app/', // frontend origin
//     credentials: true // if you're using cookies or sessions
// }));

// router middleware.
const apiRouter = express.Router();
app.use('/api/v1', apiRouter);
apiRouter.use('/lead',router.lead_router);

app.listen(API_PORT,()=>{
    console.log(`Server is running at port number ${API_PORT}`);
})
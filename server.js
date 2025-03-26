require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 3000;
const morgan = require('morgan');
const homeRouter = require('./src/routers/home.router')
const authRouter = require('./src/routers/auth.router');
const uploadDataRouter = require('./src/routers/uploadData.router')
const { authenticateToken } = require('./src/middlewares/identification');
const { uploadData } = require('./src/controllers/uploadData.controller');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser())

// CORS Configuration
app.use(cors({
    origin: 'http://localhost:8080', // Updated to match your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));


app.use(morgan('dev'));


mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('✅ Database connected');
}).catch(err => {
    console.log(err)
})


app.use('/api', homeRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload',uploadDataRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
 
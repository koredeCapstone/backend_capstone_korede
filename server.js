require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const morgan = require('morgan');
const homeRouter = require('./src/routers/home.router')
const authRouter = require('./src/routers/auth.router');
const { authenticateToken } = require('./src/middlewares/identification');
const { uploadData } = require('./src/controllers/uploadData.controller');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser())


app.use(morgan('dev'));


mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('✅ Database connected');
}).catch(err => {
    console.log(err)
})


app.use('/api', homeRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload',authenticateToken ,uploadData);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

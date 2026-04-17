const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const jobsRoute = require('./routes/jobs');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobsRoute);

const PORT = process.env.PORT 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

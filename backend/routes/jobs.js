const express = require('express');
const router = express.Router();
const pool = require('../db');



// Get all jobs

router.get('/', async (req, res) => {

   try {

    const [rows] = await pool.query("SELECT * from jobs")

    if(rows.length > 0) {
        res.status(200).json(rows)
    }

   }
   catch(err) {
    console.log(err)
    res.status(404).json({message : "no jobs found"})
   }

})

module.exports = router;


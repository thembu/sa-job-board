const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all jobs

router.get("/", async (req, res) => {
  try {
    const {
      page,
      limit,
      location,
      job_type,
      experience_level,
      is_graduate_friendly,
      salary_min,
      salary_max,
      keyword,
    } = req.query;

    console.log("query received:", req.query);
   console.log("is_graduate_friendly value:", is_graduate_friendly, typeof is_graduate_friendly);

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const values = [];

    if (keyword) {
      conditions.push("(title LIKE ? OR company LIKE ?)");
      values.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (location) {
      conditions.push("location LIKE ?");
      values.push(`%${location}%`);
    }
    if (job_type) {
      conditions.push("job_type = ?");
      values.push(job_type);
    }
    if (experience_level) {
      conditions.push("experience_level = ?");
      values.push(experience_level);
    }
    if (is_graduate_friendly === "true") {
      conditions.push("is_graduate_friendly = 1");
    }
    if (salary_min) {
      conditions.push("salary_min >= ?");
      values.push(parseInt(salary_min));
    }
    if (salary_max) {
      conditions.push("salary_max <= ?");
      values.push(parseInt(salary_max));
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT * FROM jobs ${where} ORDER BY date_posted DESC LIMIT ? OFFSET ?`,
      [...values, limitNum, offset]
    );

    if (rows.length > 0) {
      res.status(200).json({
        data: rows,
        length: rows.length,
        page: pageNum,
        limit: limitNum,
        message: "jobs retrieved successfully",
      });
    } else {
      res.status(404).json({ message: "no jobs found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
});


// Get all skills with count of jobs that require them
router.get("/skills", async (req, res) => {
  try {
    let rows = await pool.query(
        "SELECT s.name, COUNT(*) as count FROM job_skills js JOIN skills s ON js.skill_id = s.id GROUP BY js.skill_id ORDER BY count DESC"
    );
    if (rows.length > 0) {
      rows = rows[0].map((row) => ({
        skill: row.name,
        count: row.count,
      }));

      res.status(200).json({ data: rows, message: "skills retrieved successfully" });
    } else {
      res.status(404).json({ message: "no skills found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
});


// Get average salary for each skill
router.get("/salaries", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.name as skill,
        ROUND(AVG(j.salary_min)) as avg_min,
        ROUND(AVG(j.salary_max)) as avg_max
      FROM job_skills js
      JOIN skills s ON js.skill_id = s.id
      JOIN jobs j ON js.job_id = j.id
      WHERE j.salary_min IS NOT NULL 
      AND j.salary_max IS NOT NULL
      GROUP BY js.skill_id
      ORDER BY avg_max DESC
    `);

    if (rows.length > 0) {
      res.status(200).json({ data: rows, message: "salaries retrieved successfully" });
    } else {
      res.status(404).json({ message: "no salary data found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
});



// Get job by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
    SELECT j.*, GROUP_CONCAT(s.name) as skills 
    FROM jobs j
    LEFT JOIN job_skills js ON j.id = js.job_id
    LEFT JOIN skills s ON js.skill_id = s.id
    WHERE j.id = ?
    GROUP BY j.id
`,
      [id],
    );

    if (rows.length > 0) {
      const job = rows[0];
      job.skills = job.skills ? job.skills.split(",") : [];

      res.status(200).json({ data: job, message: "job retrieved successfuly" });
    } else {
      res.status(404).json({ message: "job not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error" });
  }
});



module.exports = router;

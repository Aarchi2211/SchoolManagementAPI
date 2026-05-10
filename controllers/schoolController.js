const db = require("../db");
const calculateDistance = require("../utils/distanceCalculator");

exports.addSchool = (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validation
  if (!name || !address || latitude == null || longitude == null) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return res.status(400).json({
      message: "Latitude and Longitude must be numbers",
    });
  }

  const sql =
    "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    [name, address, latitude, longitude],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
          error: err,
        });
      }

      res.status(201).json({
        message: "School added successfully",
      });
    }
  );
};

exports.listSchools = (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({
      message: "Invalid coordinates",
    });
  }

  const sql = "SELECT * FROM schools";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
      });
    }

    const schoolsWithDistance = results.map((school) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        school.latitude,
        school.longitude
      );

      return {
        ...school,
        distance: distance.toFixed(2) + " km",
      };
    });

    schoolsWithDistance.sort((a, b) => {
      return parseFloat(a.distance) - parseFloat(b.distance);
    });

    res.status(200).json(schoolsWithDistance);
  });
};
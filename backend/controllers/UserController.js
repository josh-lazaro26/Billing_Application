const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    //Destructure fields from req.body
    const { firstName, lastName, username, password } = req.body;

    //Check for missing fields
    if (!firstName || !lastName || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const role = "user"; // default

    //Check if username already exists
    const checkUserQuery = "SELECT * FROM users WHERE username = ?";
    db.query(checkUserQuery, [username], async (err, result) => {
      if (err) {
        console.error("Username check error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Username already registered" });
      }

      //Hashed password
      const hashedPassword = await bcrypt.hash(password, 10);

      //Insert query
      const insertUser = `
        INSERT INTO users 
        (firstName, lastName, username, password, role)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertUser,
        [firstName, lastName, username, hashedPassword, role],
        (err) => {
          if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({ message: "Error inserting user" });
          }

          return res
            .status(201)
            .json({ message: "User registered successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
// User login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err.message });
        }

        if (results.length === 0) {
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res
            .status(401)
            .json({ message: "Invalid username or password" });
        }

        // Generate JWT with role
        const token = jwt.sign(
          { user_id: user.user_id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
          message: "Login successful",
          token,
          user: {
            user_id: user.user_id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            role: user.role, // important
          },
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get logged-in user info
exports.me = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    db.query(
      "SELECT * FROM user WHERE user_id = ?",
      [decoded.user_id],
      (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(results[0]);
      }
    );
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const pool = require("../config/database");
// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;

// REGISTRATION
exports.register = async (req, res) => {
  const { email, phone, password, first_name, last_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check existing user
    const existing = await client.query(
      `SELECT id FROM users WHERE email = $1 OR phone = $2`,
      [email, phone],
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // NOTT USING ENCRYPTION RN
    // const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const userResult = await client.query(
      `
      INSERT INTO users (email, phone, password)
      VALUES ($1, $2, $3)
      RETURNING id, email
      `,
      [email, phone, password],
    );

    const userId = userResult.rows[0].id;

    // Insert profile
    await client.query(
      `
      INSERT INTO user_profile (user_id, first_name, last_namme)
      VALUES ($1, $2, $3)
      `,
      [userId, first_name, last_name],
    );

    // Assign default role (assume role_id = 1 is USER)
    await client.query(
      `
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, 1)
      `,
      [userId],
    );

    // JWT
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    await client.query("COMMIT");

    return res.status(201).json({
      token,
      user: {
        id: userId,
        email,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Registration failed" });
  } finally {
    client.release();
  }
};

exports.login = async (req, res) => {
  // console.log(req.body);throw Error('ERROR SARTHAK')
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const userResult = await pool.query(
      `SELECT id, email, password, status FROM users WHERE email = $1`,
      [email],
    );
    console.log(userResult.rows);
    if (userResult.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentialswa" });
    }

    const user = userResult.rows[0];

    if (user.status !== 1) {
      return res.status(403).json({ message: "User inactive" });
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = password == user.password;
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: `${process.env.REFRESH_EXPIRES_DAYS}d`,
    });

    await pool.query(
      `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '${process.env.REFRESH_EXPIRES_DAYS} days')
      `,
      [user.id, refreshToken],
    );

    return res.json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  }
};

exports.refresh = async (req, res) => {
  // console.log(req.cookies)
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    // 1. check token exists in DB
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [refreshToken],
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    // 2. verify refresh token
    // console.log('sarthakkkkk')
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // 3. issue NEW access token
    const accessToken = jwt.sign(
      { userId: payload.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Refresh failed" });
  }
};

exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
      refreshToken,
    ]);
  }

  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};
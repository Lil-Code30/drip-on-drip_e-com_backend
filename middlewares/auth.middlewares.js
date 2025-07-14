export const authMiddlewarer = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Bearer token required" });
  }

  const token = authHeader.substring(7);

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET_WORD);

    // verify the user infos

    // req.user = decode;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(504).json({ message: "Token Expire" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Wrong Token" });
    }
    res.status(500).json({ message: "Wrong When verifying the token" });
  }
};

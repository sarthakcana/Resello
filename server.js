const express = require("express");
app = express();

require("dotenv").config();

const PORT = process.env.PORT || 1000

app.get("/", (req, res) => {
  res.json({ status: "success", code: "200" });
});

app.listen(PORT, () =>
  console.log(`Server Running on PORT : ${PORT}`),
);

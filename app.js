const express = require("express");
const cors = require("cors");
const bodyParser=require('body-parser')
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const productRoutes=require('./routes/product.routes')

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser());


app.use("/auth", authRoutes);
app.use("/product", productRoutes);

// 200 Health Check
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", code: 200 });
});

// NOT FOUND ERROR
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", code: 404 });
});

module.exports = app;

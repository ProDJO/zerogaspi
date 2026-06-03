require("dotenv").config(); // doit être en premier pour alimenter process.env
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const paymentRoutes  = require("./routes/paymentRoutes");
const ratingRoutes   = require("./routes/ratingRoutes");
const adminRoutes    = require("./routes/adminRoutes");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use("/uploads", express.static("uploads"));
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/reservations", reservationRoutes);
app.use("/deliveries", deliveryRoutes);
app.use("/payments",  paymentRoutes);
app.use("/ratings",   ratingRoutes);
app.use("/admin",     adminRoutes);
app.get("/test", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
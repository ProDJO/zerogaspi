const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/reservations", reservationRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
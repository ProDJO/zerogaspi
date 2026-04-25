const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
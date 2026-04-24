const express = require("express");
const app = express();
const PORT = 5000;

const userRoutes = require("./routes/userRoutes");

app.use(express.json());

app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
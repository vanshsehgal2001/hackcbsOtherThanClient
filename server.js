const express = require("express");
const PORT = process.env.PORT || 5000;
const config = require("config");
const data = config.get("mongoURI");
const mongoose = require("mongoose");
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");

const app = express();

mongoose.connect(data, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("connected", () => {
  console.log("Connected to mongo-db");
});

db.on("error", (err) => {
  console.log(err);
});

app.use(
  express.json({
    extended: false,
  })
);
app.use("/users", userRouter);
app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server started at Port ${PORT}`);
});

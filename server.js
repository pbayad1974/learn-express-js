const express = require("express");
const app = express();

app.set("view engine", "ejs");
// app.use(express.static("public"));
app.get("/", (req, res) => {
  res.render("index", { text: "Hello world", firstName: "test" });
});

const userRouter = require("./routes/users.js");
app.use("/users", userRouter);

app.listen(3000);

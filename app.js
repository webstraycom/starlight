const express = require('express');
const app = express();

const apiRouter = require("./routes/api.router.js");

app.use(express.json());
app.use(express.static('public'))

app.use('/', apiRouter);

app.use(function (req, res, next) {
  res.status(404).send("Not Found");
});

async function main() {
  try {
    app.listen(3000);
    console.log("Server started...");
  }
  catch (err) {
    return console.log(err);
  }
}
main();

process.on("SIGINT", async () => {
  console.log("Server stopped");
  process.exit();
});
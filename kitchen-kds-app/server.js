const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 4000;

app.use(bodyParser.json());

app.post("/print", (req, res) => {
  const job = req.body;
  console.log("🖨 Received print job:", JSON.stringify(job, null, 2));
  res.status(200).send({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Print server running at http://localhost:${PORT}`);
});

const express = require("express");
const app = express();
const port = 3000;

app.use("/prd", express.static("site"));
app.use("/file", express.static("../fs"));
//app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
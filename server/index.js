const express = require("express");
const app = express();

app.use("/prd", express.static("site"));
app.use("/file", express.static("../fs"));

const fs = require("fs");
const credentials = {
	key: fs.readFileSync("ssl/my.key", "utf8"),
	cert: fs.readFileSync("ssl/my.crt", "utf8")
};
const https = require("https");
const httpsServer = https.createServer(credentials, app);
const port = 443;

httpsServer.listen(port, () => console.log(`HTTPS Server listening on port "${port}"`));

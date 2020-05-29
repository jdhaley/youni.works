const fs = require('fs');
const https = require('https');

const express = require("express");

const credentials = {
	key: fs.readFileSync('ssl/my.key', 'utf8'),
	cert: fs.readFileSync('ssl/my.crt', 'utf8')
};
const app = express();
const httpsServer = https.createServer(credentials, app);
const port = 443;

httpsServer.listen(port);

app.use("/prd", express.static("site"));
app.use("/file", express.static("../fs"));

//app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

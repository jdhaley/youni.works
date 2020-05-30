const express = require("express");
const app = express();
var bodyParser = require('body-parser');
app.use("/prd", express.static("site"));
app.use("/file", filer);
const fs = require("fs");
//const process = require("process");

const credentials = {
	key: fs.readFileSync("ssl/my.key", "utf8"),
	cert: fs.readFileSync("ssl/my.crt", "utf8")
};
const https = require("https");
const httpsServer = https.createServer(credentials, app);
const port = 443;

httpsServer.listen(port, () => console.log(`HTTPS Server listening on port "${port}" for "${__dirname}"`));

function filer(req, res) {
	let path = "../fs/" + req.url.substring(req.url.indexOf("?") + 1);
	if (req.method == "GET") {
		let file = fs.readFileSync(path);
		res.send(file);
		res.end();
	} else if (req.method == "PUT") {
		req.pipe(fs.createWriteStream(path));
		res.end();
	} else {
		res.end(400);
	}
}
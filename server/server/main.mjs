export default function main(sys, conf) {
	const pkg = conf.packages;
	
	const app = pkg.express();
	app.use("/prd", pkg.express.static("site"));
	app.use("/file", filer);
	
	const credentials = {
		key: pkg.fs.readFileSync(conf.key, "utf8"),
		cert: pkg.fs.readFileSync(conf.cert, "utf8")
	};
	const httpsServer = pkg.https.createServer(credentials, app);

	httpsServer.listen(conf.port, () => console.log(`NEW HTTPS Server listening on port "${conf.port}"`));
	return httpsServer;
	
	function filer(req, res) {
		let path = conf.files + req.url.substring(req.url.indexOf("?") + 1);
		if (req.method == "GET") {
			let file = pkg.fs.readFileSync(path);
			res.send(file);
			res.end();
		} else if (req.method == "PUT") {
			req.pipe(pkg.fs.createWriteStream(path));
			res.end();
		} else {
			res.end(400);
		}
	}
}


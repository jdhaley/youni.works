export default function main(sys, conf) {
	const pkg = conf.packages;
	
	const app = pkg.express();
	app.use("/prd", pkg.express.static(conf.site));
	app.use("/file", filer);
	
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
	
	const credentials = {
		key: pkg.fs.readFileSync(conf.key),
		cert: pkg.fs.readFileSync(conf.cert)
	};
	const httpsServer = pkg.https.createServer(credentials, app);

	httpsServer.listen(conf.port, () => console.log(`NEW HTTPS Server listening on port "${conf.port}"`));
	return httpsServer;
}


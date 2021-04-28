export default function main(sys, conf) {
	const pkg = conf.packages;
	
	const app = pkg.express();
	app.use("/prd", pkg.express.static(conf.site));
	app.use("/file", filer);
//	app.use("/packages.json", pkgdep);
//	function pkgdep(req, res) {
//		res.type("json");
//		res.send('[{"name": "a"},{"name": "b"}]');		
//	}
	function filer(req, res) {
		let path = conf.files + req.url.substring(req.url.indexOf("?") + 1);
		if (req.method == "GET") {
			let file;
			try {
				file = pkg.fs.readFileSync(path);
			} catch (error) {
			//	console.log("GET:", error);
				res.status(204);
				res.end();
				return;
			}
			if (req.url.endsWith(".css")) {
				res.writeHead(200, {"Content-Type": "text/css"});
				res.write(file);
				res.end();
			} else {
				res.send(file);
			}
		} else if (req.method == "PUT") {
			let pathnameIdx = path.lastIndexOf("/");
			let dir = path.substring(0, pathnameIdx);
			pkg.fs.mkdir(dir, {
				recursive: true
			}, err => {
				if (err) throw err;
			});
			try {
				let stream = pkg.fs.createWriteStream(path);
				stream.on("error", err => console.log(err));
				req.pipe(stream);
			} catch (error) {
				if (error.code == "ENOENT") {
					res.status(404);
				} else {
					console.warn(error);
					res.status(500);
				}
			}
		} else {
			res.status(400);
		}
		res.end();
	}
	
	const credentials = {
		key: pkg.fs.readFileSync(conf.key),
		cert: pkg.fs.readFileSync(conf.cert)
	};
	const httpsServer = pkg.https.createServer(credentials, app);

	httpsServer.listen(conf.port, () => console.log(`NEW HTTPS Server listening on port "${conf.port}"`));
	return httpsServer;
}


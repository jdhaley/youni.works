import express		from "express";
import fs			from "fs";
import https		from "https";

import filer		from "./filer.mjs";
import compile		from "./compile.mjs";
import loader 		from "./loader.mjs";

export default function main(conf) {
	compile("../source", "../target");
	const app = express();
	app.use("/app", express.static("app"));
	app.use("/res", express.static("res"));
	app.use(conf.siteEnv, express.static(conf.siteDir));
	app.use("/target", express.static("../target"));
	app.use(conf.fileAlias, filer(conf.fileDir));
	app.use("/sources", loader("../source"));
	
	const credentials = {
		key: fs.readFileSync(conf.key),
		cert: fs.readFileSync(conf.cert)
	};
	const httpsServer = https.createServer(credentials, app);

	httpsServer.listen(conf.port, () => console.log(`HTTPS Server listening on port "${conf.port}"`));
	return httpsServer;
}


import { bundle, extend } from "../base/util.js";
import {Request} from "./response.js";

export default function start(conf: bundle<any>) {
	let modules = conf.modules;
	console.info(`Service file context "${modules.fs.realpathSync(".")}"`)
	let service = startService(conf);
	const httpServer = modules.http.createServer(service);
	httpServer.listen(conf.server.port, () => console.info());
	console.info(`Service listening on HTTP port "${conf.server.port}"`)	
}

function startService(conf: bundle<any>) {
	let service = conf.modules.express();
	service.use(conf.modules.bodyParser.text({type: "*/*"}));
	config(service, conf);
	return service;
}

function config(service: any, conf: bundle<any>) {
	for (let path in conf.endpoints) {
		createAction(service, conf, path, conf.endpoints[path]);
	}
}

function createAction(service: any, conf: bundle<any>, path: string, endpoint: any) {
	let action: any;
	switch (typeof endpoint) {
		case "string":
			action = conf.engine.static(endpoint);
			console.log(path + ":", JSON.stringify(endpoint));
			break;
		// case "object":
		// 	action = conf.engine.Router();
		// 	config(conf, ctx, endpoint);
		// 	break;
		case "function":
			action = function doAction(req: Request) {
				let res = req["res"];
				res.fs = conf.modules.fs;
				res.context = conf;
				return endpoint(res);
			}
			console.log(path, endpoint.name);
			break;
	}
	service.use(path, action);
}

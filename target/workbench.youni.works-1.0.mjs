import system from "./system.youni.works-2.1.mjs";
import service from "./service.youni.works-1.0.mjs";
const module = {
	"name": "workbench.youni.works",
	"version": "1.0",
	"moduleType": "service"
};
module.use = {
	"system": system,
	"service": service,
};
module.package = {
};
const conf = {
	"service": {
		"type$": "/service/service/Service",
		"engine": "express",
		"endpoints": {
			"/workbench.html": "static/workbench.html",
			"/module/index.mjs": "../../target/app.youni.works-1.1.mjs",
			"/module": "../../target",
			"/res": "static/res",
			"/file": "static/fs",
			"/sources": "static/sources.txt",
			"/test1": {
				"type$": "/service/service/Test",
				"value": "one"
			},
			"/test2": {
				"type$": "/service/service/Test",
				"value": "two"
			}
		}
	}
};
const main = function main(module, conf) {
	module = module.use.system.load(module);
	return module.create(conf.service);
};
export default main(module, conf);

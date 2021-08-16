import system from "./system.youni.works-2.1.mjs";
import ui from "./ui.youni.works-1.1.mjs";
import compiler from "./compiler.youni.works-1.0.mjs";
const module = {
	"name": "workbench.app.youni.works",
	"version": "1.1",
	"moduleType": "ui"
};
module.use = {
	system: system,
	ui: ui,
	compiler: compiler
}
module.package = {
}
const conf = {
	"dataConverter": "/compiler/converter/Converter",
	"ownerType": "/display/Frame",
	"appType": "/app/App",
	"window": null,
	"editors": {
		"type$string": "/ui/editors/String",
		"type$number": "/ui/editors/Number",
		"type$date": "/ui/editors/Date",
		"type$boolean": "/ui/editors/Boolean",
		"type$link": "/ui/editors/Link",
		"type$color": "/ui/editors/Color"
	},
	"type$events": "/gdr"
};
const main = function main(module, conf) {
	module = module.use.system.load(module);
	conf.window = window;
	let app = module.create("/ui/app/App");
	app.start(conf);
	return module;
};
export default main(module, conf);

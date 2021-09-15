import system from "./system.youni.works-2.1.mjs";
import base from "./base.youni.works-1.2.mjs";
const module = {
	"name": "display.youni.works",
	"version": "1.0",
	"moduleType": "library"
};
module.use = {
	system: system,
	base: base
}
module.package = {
}
const conf = undefined;
const main = function main_loadModule(module) {
			return module.use.system.load(module);
		};
export default main(module, conf);

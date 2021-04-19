import system 	from "../system/index.mjs";
import module 	from "./module.mjs";
import conf		from "./conf.mjs";
import main		from "./main.mjs";

export default main({
	system: system,
	module: module,
	app: conf.mjs
});
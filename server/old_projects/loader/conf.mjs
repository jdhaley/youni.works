import control		from "../base/package/control.mjs";
import client		from "../web/package/client.mjs";

import parser		from "./package/parser.mjs";
import loader		from "./package/loader.mjs";

//import parts		from "./conf/parts.mjs";
import services		from "./conf/services.mjs";

export default {
	packages: {
		control: control,
		platform: client,
		parser: parser,
		loader: loader,
		
		services: services
	},
	test: control
}
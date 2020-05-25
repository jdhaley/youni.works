import signal		from "../base/package/signal.mjs";
import part			from "../base/package/part.mjs";
import platform		from "../web/package/platform.mjs";

import parser		from "./package/parser.mjs";
import loader		from "./package/loader.mjs";

//import parts		from "./conf/parts.mjs";
import services		from "./conf/services.mjs";

export default {
	packages: {
		signal: signal,
		part: part,
		platform: platform,
		parser: parser,
		loader: loader,
		
		services: services
	},
	test: part
}
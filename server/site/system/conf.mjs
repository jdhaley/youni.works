import facets from "./conf/facets.mjs";
import symbols from "./conf/symbols.mjs";

import core from "./package/core.mjs";
import reflect from "./package/reflect.mjs";
import engine from "./package/engine.mjs";

export default {
	module: {
		id: "system.youni.works",
		version: "2.0",
		moduleType: "system",
	},
	packages: {
		core: core,
		reflect: reflect,
		engine: engine
	},
	facets: facets,
	symbols: symbols
}
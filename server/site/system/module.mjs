import core from "./package/core.mjs";
import engine from "./package/engine.mjs";

export default {
	id: "system.youni.works",
	version: "2.0",
	moduleType: "system",
	uses: [],
	packages: {
		core: core,
		engine: engine
	}
}
import base from "../base/index.mjs";

import example from "./package/example.mjs";

export default {
	sys: base.sys,
	module: {
		id: "eb.youni.works",
		version: "1",
		moduleType: "service",
		uses: [base],
	},
	packages: {
		example: example
	}
}
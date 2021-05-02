import base from "../base/index.mjs";

import view from "./package/view.mjs";
import diagram from "./package/diagram.mjs";
import object from "./package/object.mjs";

import example from "./package/example.mjs";

export default {
	sys: base.sys,
	module: {
		id: "ui.youni.works",
		version: "1",
		moduleType: "library",
		uses: [base]
	},
	packages: {
		view: view,
		diagram: diagram,
		object: object,
		example: example
	}
}
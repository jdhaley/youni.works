import control from "./package/control.mjs";
import layout from "./package/layout.mjs";
import input from "./package/input.mjs";

import testModel from "./testModel.mjs";

export default {
	packages: {
		control: control,
		input: input,
		layout: layout,
		model: testModel,
	}
}
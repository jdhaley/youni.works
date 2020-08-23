import control from "./package/control.mjs";
import layout from "./package/layout.mjs";
import input from "./conf/input.mjs";

import test from "./test.mjs";
import testModel from "./testModel.mjs";

export default {
	packages: {
		control: control,
		input: input,
		layout: layout,
		test: test,
		model: testModel
	}
}
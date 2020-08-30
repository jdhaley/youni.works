import control from "./package/control.mjs";
import layout from "./package/layout.mjs";
import input from "./package/input.mjs";
import item from "./package/item.mjs";

import testModel from "./testModel.mjs";

export default {
	packages: {
		control: control,
		input: input,
		layout: layout,
		item: item,
		model: testModel,
	}
}
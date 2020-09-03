import control from "./package/control.mjs";
import layout from "./package/layout.mjs";
import item from "./package/item.mjs";

import types from "./conf/types.mjs";

import testModel from "./testModel.mjs";

import loader from "./package/loader.mjs";

export default {
	packages: {
		control: control,
		layout: layout,
		item: item,
		loader: loader
	},
	testLoader: control,
	model: testModel,
	types: types
}
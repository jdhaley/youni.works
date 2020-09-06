import control from "./package/control.mjs";
import view from "./package/view.mjs";
import cell from "./package/cell.mjs";
import app from "./package/app.mjs";

import types from "./conf/types.mjs";

export default {
	packages: {
		control: control,
		view: view,
		cell: cell,
		app: app,
	},
	types: types
}
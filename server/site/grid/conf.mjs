import control from "./package/control.mjs";
import command from "./package/command.mjs";
import remote from "./package/remote.mjs";
import view from "./package/view.mjs";
import cell from "./package/cell.mjs";
import app from "./package/app.mjs";

import types from "./conf/types.mjs";
import mm from "./conf/albumTypes.mjs";

export default {
	packages: {
		control: control,
		command: command,
		remote: remote,
		view: view,
		cell: cell,
		app: app
	},
	types: types,
	mm: mm
}
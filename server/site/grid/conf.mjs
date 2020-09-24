import control from "./package/control.mjs";
import command from "./package/command.mjs";
import remote from "./package/remote.mjs";
import view from "./package/view.mjs";
import cell from "./package/cell.mjs";
import layout from "./package/layout.mjs";
import app from "./package/app.mjs";

export default {
	packages: {
		control: control,
		command: command,
		remote: remote,
		view: view,
		cell: cell,
		layout: layout,
		app: app
	}
}
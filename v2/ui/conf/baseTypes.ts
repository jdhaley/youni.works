import { bundle } from "../../base/util.js";

import { Box } from "../../control/box.js";
import { EditBox } from "../../control/editBox.js";
import { Caption, DisplayType } from "../display.js";

import shortcuts from "./shortcuts.js";
import viewActions from "../actions/view.js";
import editorActions from "../actions/edit/editor.js";

const conf: bundle<any> = {
	display: {
		class: DisplayType,
		prototype: new Box(),
		actions: viewActions,
		shortcuts: shortcuts
	},
	editor: {
		class: DisplayType,
		prototype: new EditBox,
		actions: editorActions,
		shortcuts: shortcuts
	},
	caption: {
		class: DisplayType,
		prototype: new Caption(),
		type: "display",
		tagName: "header",
		shortcuts: shortcuts
	}
}
export default conf;
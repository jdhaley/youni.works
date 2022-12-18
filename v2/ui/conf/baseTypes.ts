import { bundle } from "../../base/util.js";

import { Box } from "../../control/box.js";
import { EditBox } from "../../control/editBox.js";
import { Label, DisplayType } from "../display.js";

import shortcuts from "./shortcuts.js";
import viewActions from "../actions/view.js";
import editorActions from "../actions/edit/editor.js";

const conf: bundle<any> = {
	display: {
		class: DisplayType,
		prototype: new Box(),
		actions: viewActions,
		shortcuts: shortcuts,
		style: {
			//ensures custom Elements have block rather than span.
			display: "block"
		}
	},
	editor: {
		class: DisplayType,
		prototype: new EditBox,
		actions: editorActions,
		shortcuts: shortcuts,
	},
	label: {
		class: DisplayType,
		prototype: new Label(),
		type: "display",
		tagName: "header",
		style: {
			color: "darkgray",
			font_size: "smaller"
		},
		shortcuts: shortcuts
	}
}
export default conf;
import {Article} from "../items/baseDisplay.js";
import {RangeCommands} from "../items/editor.js";
import frame from "../../../ui/controllers/frame.js";
import shortcuts from "../../../ui/conf/shortcuts.js";

import actions from "./conf/actions.js";
import transformer from "./conf/transformer.js";

export default {
	frame: {
		types: {
			Article: Article
		},
		events: frame,
		actions: {}
	},
	note: {
		type: "Article",
		nodeName: "ARTICLE",
		styles: "note",
		shortcuts: shortcuts,
		actions: actions,
		transform: transformer,
		commands: new RangeCommands()
	}
}

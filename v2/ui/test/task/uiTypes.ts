import { Signal } from "../../../base/controller.js";
import { extend } from "../../../base/util.js";
import { Box } from "../../../control/box.js";

import { UserEvent } from "../../frame.js";

import shape from "../../actions/shape.js";

export default {
	styles: {
		type: "display",
		styles: {
			".field": {
				padding: "2px"
			},
			".field>.content": {
				border: "1px solid gainsboro",
				border_radius: "3px",
				padding: "2px",
				min_height: "21px"
			},
			body: {
				display: "block"
			}
		}
	},
	xlabel: {
		type: "display",
		styles: {
			".record>.label": {
				font_size: "10pt",
				color: "gray"
			}
		}
	},
	dialog: {
		type: "panel",
		header: "caption",
		kind: "dialog",
		title: "Dialog",
		styles: {
			".dialog>.content": {
				padding: "4px",
				border: "0 solid gainsboro",
				border_width: "0 1px 1px 1px"
			}		
		}
	},
	caption:  {
		type: "panel",
		header: "display",
		body: "label",
		styles: {
			this: {
				display: "flex",
				flex_direction: "row-reverse",
				background_color: "lightsteelblue",
				color: "white",
				padding: "3px 6px 3px 6px"
			},
			content: {
				flex: 1
			}				
		},
		actions: extend(shape, {
			view: function (this: Box, event: UserEvent) {
				this.body.view.textContent = "Dialog"; //this.partOf.type.conf.title;
			},
			click: function (this: Box, event: UserEvent) {
				if (event.target.getAttribute("data-cmd") == "edit") {
					(this.partOf as Box).body.view.textContent = "click edit";
				}
			}
		})
	},
	taskDialog:{
		type: "dialog",
		body: "tasks",
		styles: {
			".label": `
				color: steelblue;
			`,
			".dialog>.content": `
				display: flex;
				flex-direction: row;
			`,
			".dialog>.content>*": `
				flex: 1;
			`
		}
	}
}

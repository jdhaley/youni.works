import { Signal } from "../../../base/controller.js";
import { extend } from "../../../base/util.js";
import { Box } from "../../../control/box.js";

import { UserEvent } from "../../frame.js";

import shape from "../../actions/shape.js";
import { Display, DisplayType } from "../../display.js";
import { Loader } from "../../../base/type.js";


// interface TableConf {
// 	contentType: string,
// 	header: {
// 		style?: object
// 	}
// }
// class TableHeader extends Box {

// }
// class Table extends Box {
// 	draw(value: unknown) {
// 		this.header = this.type.header.create() as Box;
// 		this.view.append(this.header.view);
// 		this.header.draw(value);

// 		this.header = 
// 		let type = this.body.type;
// 		for (let name in type.types)
// 	}
// }

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
			},
			".tableHeader": {
				display: "flex",
				color: "steelblue",
				font_weight: "lighter"
			}
		}
	},
	xlabel: {
		type: "display",
		styles: {
			".field>.label": {
				font_size: "10pt",
				color: "gray"
			}
		}
	},
	dialog: {
		type: "panel",
		title: "Dialog",
		tagName: "ui-dialog",
		header: "dialogCaption",
		actions: shape,
		styles: {
			"ui-dialog>ui-dialog-body": `
				display: flex;
				flex-direction: column;
				padding: 4px;
				border: 0 solid gainsboro;
				border-width: 0 1px 1px 1px;
			`
		}
	},
	dialogCaption:  {
		type: "panel",
		tagName: "ui-dialog-caption",
		header: "label",
		body: {
			type: "display",
			style: {
				color: "inherit",
				font_size: "normal"
			}
		},
		style: {
			display: "flex",
			background_color: "lightsteelblue",
			color: "white",
			padding: "3px 6px 3px 6px"
		},
		actions: {
			view: function (this: Box, event: UserEvent) {
				this.body.view.textContent = this.partOf.body.type.conf.title;
			}
		}
	},
	taskDialog:{
		type: "dialog",
		body: {
			type: "tasks",
			header: "display",
			body: "display",
			tableType: "task"
		}
	}
}

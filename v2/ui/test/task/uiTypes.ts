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
		styles: {
			"ui-dialog>.content": `
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
		header: "display",
		body: {
			type: "label",
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
		actions: extend(shape, {
			view: function (this: Box, event: UserEvent) {
				this.body.view.textContent = this.partOf.body.type.conf.title;
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
	}
}

import { ElementView, extendDisplay } from "./display.js";

import shape from "../actions/shape.js";
import { UserEvent } from "../../control/frame.js";

export {base, dialog, formDialog}

const base = {
	prototype: new ElementView(),
};

const dialog = {
	type: base,
	kind: "dialog",
	props: {
		title: "Dialog"
	},
	header: {
		type: base,
		kind: "caption",
		header: {
			content: () => "<i data-cmd='edit'>✎</i>"
		},
		content: "Dialog",
		style: {
			".dialog>.caption": {
				display: "flex",
				flex_direction: "row-reverse",
				background_color: "lightsteelblue",
				color: "white",
				padding: "3px 6px 3px 6px"
			},
			".dialog>.caption>.content": {
				flex: 1
			}				
		},
		actions: {
			render: function (this: ElementView, event: UserEvent) {
				this.content.textContent = (this.partOf as ElementView).props.title;
			},
			click: function (this: ElementView, event: UserEvent) {
				if (event.target.getAttribute("data-cmd") == "edit") {
					(this.partOf as ElementView).content.textContent = "click edit";
				}
			}
		}
	},
	content: "",
	style: {
		".dialog>.content": {
			padding: "4px",
			border: "0 solid gainsboro",
			border_width: "0 1px 1px 1px"
		}		
	},
	actions: shape
};

const formDialog = {
	type: dialog,
	style: {
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
};

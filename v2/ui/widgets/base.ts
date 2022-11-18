import { ElementView, extendDisplay } from "./display.js";

import shape from "../actions/shape.js";
import { UserEvent } from "../../control/frame.js";

export {base, dialog, formDialog}

const base = {
	prototype: new ElementView(),
};

const dialog = extendDisplay(base, {
	type: base,
	kind: "dialogue",
	props: {
		title: "Dialogue"
	},
	header: {
		type: base,
		kind: "caption",
		header: {
			content: () => "<i data-cmd='edit'>✎</i>"
		},
		content: "Dialogue",
		style: {
			".caption": {
				background_color: "lightsteelblue",
				color: "white",
				padding: "3px 6px 3px 6px"
			},	
			".dialogue>.caption": {
				display: "flex",
				flex_direction: "row-reverse"
			},
			".dialogue>.caption>.content": {
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
		".dialogue>.content": {
			padding: "4px",
			border: "0 solid gainsboro",
			border_width: "0 1px 1px 1px"
		}		
	},
	actions: shape
});

const formDialog = extendDisplay(dialog, {
	style: {
		".label": `
			color: steelblue;
		`,
		".dialogue>.content": `
			display: flex;
			flex-direction: row;
		`,
		".dialogue>.content>*": `
			flex: 1;
		`
	}
});

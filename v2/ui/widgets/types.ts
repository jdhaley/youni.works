import { Signal } from "../../base/controller.js";
import { UserEvent } from "../../control/frame.js";
import { Box, Display, ElementDisplay, icon } from "../../control/box.js";

import shape from "../actions/shape.js";

export default {
	dialog: {
		type: "base",
		kind: "dialog",
		props: {
			title: "Dialog"
		},
		header: {
			type: "base",
			kind: "caption",
			header: {
				content: () => icon("edit")
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
				render: function (this: ElementDisplay, event: UserEvent) {
					this.content.textContent = (this.partOf as ElementDisplay).props.title;
				},
				click: function (this: ElementDisplay, event: UserEvent) {
					if (event.target.getAttribute("data-cmd") == "edit") {
						(this.partOf as ElementDisplay).content.textContent = "click edit";
					}
				}
			}
		},
		content: "dialog content",
		style: {
			".dialog>.content": {
				padding: "4px",
				border: "0 solid gainsboro",
				border_width: "0 1px 1px 1px"
			}		
		},
		actions: shape
	},
	formDialog: {
		type: "dialog",
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
	},
	action: {
		type: "base",
		props: {
			action: "",
			icon: ""
		},
		content: (i: Display) => `<i class="material-icons" data-cmd="${i.props.action}">${i.props.icon}</i>`,
		actions: {
			click(this: Box, event: Signal) {
				event.subject = this.props.action;
			}
		}
	},
	workbench: {
		type: "base",
		kind: "wb",
		header: {
			type: "base",
			kind: "wb-header",
			content: "Header",
		},
		content: {
			nav: {
				type: "base",
				content: {
					main: {
						type: "action",
						props: {
							action: "activateTab",
							icon: "dashboard"
						}
					}
				}
			},
			body: {
				content: {
					tree: {
						content: "tree"
					},
					editors: {
						content: "editors"
					}
				}
			}
		},
		footer: {
			kind: "wb-footer",
			content: "Footer",
		},
		style: {
			".wb": {
				color: "white",
				background: "black"
			},
			".wb>.content": {
				display: "flex",
				flex_direction: "row",
				color: "black",
				background: "white"
			}
		}
	}
}
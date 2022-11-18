import { Frame } from "../../control/frame.js";
import controller from "../actions/frame.js";

import { create, extendDisplay } from "./display.js";
import { base, dialog, formDialog } from "./base.js";

const frame = new Frame(window, controller);

create(document.body, {
	type: dialog,
	props: {
		title: "Hello world!"
	},
	content: "instance content",
});

let person = extendDisplay(formDialog, {
	type: formDialog,
	kind: "person",
	props: {
		title: "Person"
	},
	content: {
		firstName: {
			header: {
				kind: "label",
				content: () => "<b>F</b>irst <b>N</b>ame"
			},
			content: "Billy"
		},
		lastName: {
			header: {
				kind: "label",
				content: "Last Name"
			},
			content: "Willy"
		},
		dob: {
			header: {
				kind: "label",
				content: "Date of Birth"
			},
			content: new Date().toISOString()
		},
		job: {
			header: {
				kind: "label",
				content: "Job Info"
			},
			content: {
				name: {
					header: {
						kind: "label",
						content: "Job Name"
					},
					content: "&nbsp;"
				},
				band: {
					header: {
						kind: "label",
						content: "Band Level"
					},
					content: 0
				}
			}
		}
	},
	footer: {
		type: base,
		content: "A person is a person no matter who small.",
		style: {
			FOOTER: {
				padding_top: "4px",
				font_size: "x-small"
			}			
		}
	},
	actions: {
	}
});

create(document.body, {
	type: person,
	kind: " flat  iron",
	header: {
		content: "New Person"
	}
});

frame.send("render", document.body);

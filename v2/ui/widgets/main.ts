import { Frame, UserEvent } from "../../control/frame.js";
import { create, Display, ElementView, extendDisplay } from "./display.js";

import controller from "../actions/frame.js";
import shape from "../actions/shape.js";

const frame = new Frame(window, controller);

let base = {
	prototype: new ElementView(),
}

// let caption = extendDisplay(base, {
// 	type: base,
// 	kind: "caption",
// 	header: {
// 	},
// 	content: "Dialogue",
// });
//We need to handle if a Display is extended outside of a create(). For now just
//call the extendDisplay directly.

let dialog = extendDisplay(base, {
	type: base,
	kind: "dialogue",
	header: {
		type: base,
		kind: "caption",
		header: {
			content: () => "<i data-cmd='edit'>✎</i>"
		},
		content: "Dialogue",
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
	actions: shape
});

create(document.body, {
	type: dialog,
	props: {
		title: "Hello world!"
	},
	content: "instance content",
});

let person = extendDisplay(dialog, {
	type: dialog,
	kind: "person",
	props: {
		title: "Person"
	},
	// header: {
	// 	kind: "caption",
	// 	content: "Person"
	// },
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
		content: "A person is a person no matter who small."
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
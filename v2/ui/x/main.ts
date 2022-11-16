import { Frame } from "../../control/frame.js";
import { create, Display, ElementView, extendDisplay } from "./display.js";

import controller from "../actions/frame.js";
import shape from "../actions/shape.js";

new Frame(window, controller);

let base = {
	prototype: new ElementView(),
}

//We need to handle if a Display is extended outside of a create(). For now just
//call the extendDisplay directly.

let taskParent = extendDisplay(base, {
	type: base,
	kind: "task",
	props: {
		aprop: "a value"
	},
	header: {
		type: base,
		kind: "caption",
		content: "task test",
	},
	content: "task content",
	actions: shape
});

create(document.body, {
	type: taskParent,
	header: {
		content: "Hello task world!"
	},
	content: "task instance content",
	actions: {
		click: () => console.log("you freak")
	}
});

let person: Display = {
	kind: "person",
	props: {
		title: "Person"
	},
	header: {
		kind: "caption",
		content: "Person"
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
		}
	},
	footer: {
		content: "A person is a person no matter how small."
	},
	actions: {
	}
}

create(document.body, {
	type: person,
	kind: " flat  iron",
	header: {
		content: "New Person"
	}
});

import { Frame } from "../../control/frame.js";
import { create, Display, ElementView, extendDisplay } from "./display.js";

import controller from "../actions/frame.js";
import shape from "../actions/shape.js";

let base = {
	prototype: new ElementView(),
}

new Frame(window, controller);
//We need to handle if a Display is extended outside of a create(). For now just
//call the extendDisplay directly.

let dialog = extendDisplay(base, {
	type: base,
	kind: "dialogue",
	props: {
		aprop: "a value"
	},
	header: {
		type: base,
		kind: "caption",
		content: "Test thing",
	},
	content: "test content",
	actions: shape
});

let instance = {
	type: dialog,
	content: "instance content"
}

create(document.body, instance);

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
		content: "A person is a person no matter who small."
	},
	actions: {
	}
}
person = extendDisplay(person, {
	kind: " flat  iron",
	header: {
		content: "New Person"
	}
});
create(document.body, person);

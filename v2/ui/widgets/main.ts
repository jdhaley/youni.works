import { Frame } from "../../control/frame.js";
import { Display, ElementView, extendDisplay } from "./display.js";

import controller from "../actions/frame.js";
import shape from "../actions/shape.js";

new Frame(window, controller);

let test = {
	kind: "test",
	prop: {
		title: "Test thing"
	},
	header: {
		kind: "caption",
		content: "Test thing",
	},
	content: "test content",
	actions: shape
}
let ext = extendDisplay(test, {
	header: {
		content: "Ext thing"
	},
	content: "ext content"
})

new ElementView(document.body, ext);

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
	header: {
		content: "New Person"
	}
});
new ElementView(document.body, person);

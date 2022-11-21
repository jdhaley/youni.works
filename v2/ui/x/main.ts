import { Frame } from "../../control/frame.js";
import { create, Display, ElementView, extendDisplay } from "./display.js";

import controller from "../actions/frame.js";
import shape from "../actions/shape.js";

import { base, dialog, formDialog } from "./base.js";

new Frame(window, controller);


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
	kind: "task",
	header: {
		content: "Task"
	},
	content: {
	  id: {
		header: {
			kind: "label",
			content: () => "<b>ID</b>"
		},
		content: "0001",
		actions: {
			click: () => console.log("clicked on id content")
		}
	},
	description: {
		header: {
			kind: "label",
			content: "Description"
		},
		content: "Simple record type display (table). click on it to do a dialog of the record. ",
		actions: {
			click: () => console.log("clicked on description content")
		}
	},
	dateCreated: {
		header: {
			kind: "label",
			content: "Date Created",
			actions: {
				click: () => console.log("clicked on date created header label")
			}
		},
		content: new Date().toISOString(),
		actions: {
			click: () => console.log("clicked on date created content")
		}
	},
	status: {
		header: {
			kind: "label",
			content: "Status",
			actions: {
				click: () => console.log("clicked on status header label")
			}
		}
	}
	},
	actions: {
		click: () => console.log("clicked within task context - parent object")
	}
});



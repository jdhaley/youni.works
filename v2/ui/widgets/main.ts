import { start, TypeOwner } from "../../base/type.js";

import { Frame } from "../../control/frame.js";
import { BoxType, create, EDisp } from "../../control/box.js";

import { base, dialog, formDialog, workbench } from "./base.js";

import contentTypes from "../conf/contentTypes.js";
import controller from "../actions/frame.js";
import viewTypes from "./types.js";

const frame = new Frame(window, controller);

let baseTypes = {
	base: {
		class: BoxType,
		viewType: "text",
		prototype: new EDisp(),
	}
}
let owner: TypeOwner = {
	conf: {
		baseTypes: baseTypes,
		contentTypes: contentTypes,
		viewTypes: viewTypes,
	
		unknownType: "unknown",
		defaultType: "task",
	},
	types: {},
	unknownType: undefined
};
let loaded = start(owner);

//////////////////

owner.types.dialog.create(document.body);

create(document.body, {
	extends: dialog,
	props: {
		title: "Hello world!"
	},
	content: "instance content",
});

let person = {
	extends: formDialog,
	kind: "person dialog",
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
					content: () => "&nbsp;"
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
		extends: base,
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
};

create(document.body, {
	extends: person,
	kind: " flat  iron",
	header: {
		content: "New Person"
	}
});
create(document.body, {
	extends: workbench
});

frame.send("render", document.body);

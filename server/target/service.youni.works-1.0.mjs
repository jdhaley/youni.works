import system from "./system.youni.works-2.1.mjs";
import base from "./base.youni.works-1.2.mjs";
const module = {
	"name": "service.youni.works",
	"version": "1.0",
	"moduleType": "service"
};
module.use = {
	"system": system,
	"base": base,
};
module.package = {
	service: service(),
};
const conf = {
	"ownerType": "/ui/display/Frame",
	"appType": "/app/App",
	"window": null,
	"events": function events() {
	let NO_CLICK;
	function TARGET_EVENT(event) {
		let ctl = getControl(event.target);
		ctl && ctl.owner.sense(ctl, event);
	}
	function SELECTION_EVENT(event) {
		let ctl = getControl(event.target);
		event.range = ctl && ctl.owner.selectionRange;
		ctl = ctl && event.range.commonAncestorContainer;
		ctl && ctl.owner.sense(ctl, event);
	}
	function getControl(node) {
		while(node) {
			if (node.$peer) return node.$peer;
			node = node.parentNode;
		}
	}
	return {
		windowEvents: {		
			input: TARGET_EVENT,
			cut: TARGET_EVENT,
			copy: TARGET_EVENT,
			paste: TARGET_EVENT,
	
			keydown: TARGET_EVENT,
			click: TARGET_EVENT,		//call it "push"
			// click: function(event) {
			// 	if (NO_CLICK) {
			// 		event.preventDefault();
			// 		NO_CLICK = false;
			// 	} else {
			// 		TARGET_EVENT(event);
			// 	}
			// },
			// dragstart: TARGET_EVENT,
			// dragover: TARGET_EVENT,
			// drop: TARGET_EVENT,
	//		mouseover: TARGET_EVENT,
	//		mouseout: TARGET_EVENT,
			focusin: TARGET_EVENT,
			focusout: TARGET_EVENT,
			focus: TARGET_EVENT,
			blur: TARGET_EVENT,
			contextmenu: function(event) {
				if (event.ctrlKey) {
					event.preventDefault();
					TARGET_EVENT(event);
				}
			},
			// resize: function(event) {
			// 	let owner = event.target.document.body.$peer.owner;
			// 	owner.send(owner, event);
			// },
			select: TARGET_EVENT, //may not exist
			change: TARGET_EVENT, //may not exist
		},
		// documentEvents: {
		// 	selectionstart: SELECTION_EVENT,
		// 	selectionchange: SELECTION_EVENT
		// }
	}
},
	"type$gdr": "/ui/gdr"
};
const main = function main(module, conf) {
	module = module.use.system.load(module);
	conf.window = window;
	let app = module.create("/app/App");
	app.start(conf);
	return module;
};
export default main(module, conf);

function service() {
const pkg = {
	"type$": "/base/control",
	"Request": {
		"subject": "",
		"content": undefined
	},
	"Service": {
		"category": "static",
		"service": function service(request) {
            
        },
		"extend$actions": {
			"get": function get(event) {
            },
			"put": function put(event) {
            }
		}
	},
	"FileService": {
		"type$": "/service/Service",
		"path": ""
	}
}
return pkg;
}

import system from "./system.youni.works-2.1.mjs";
import ui from "./ui.youni.works-1.1.mjs";
import compiler from "./compiler.youni.works-1.0.mjs";
const module = {
	"name": "app.youni.works",
	"version": "1.1",
	"moduleType": "ui"
};
module.use = {
	system: system,
	ui: ui,
	compiler: compiler
}
module.package = {
}
const conf = {
	"dataConverter": "/compiler/converter/Converter",
	"ownerType": "/display/Frame",
	"appType": "/app/App",
	"window": null,
	"events": function events() {
	let NO_CLICK;
	function TARGET_EVENT(event) {
		let ctl = getControl(event.target);
        if (ctl) {
            event.stopPropagation();
            if (!event.subject) event.subject = event.type;
            ctl.sense(event);
            if (!event.subject) event.preventDefault();    
        }
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
	
//			keydown: TARGET_EVENT,
			dblclick: TARGET_EVENT,
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
	"editors": {
		"type$string": "/ui/editors/String",
		"type$number": "/ui/editors/Number",
		"type$date": "/ui/editors/Date",
		"type$boolean": "/ui/editors/Boolean",
		"type$link": "/ui/editors/Link",
		"type$color": "/ui/editors/Color"
	},
	"type$gdr": "/gdr"
};
const main = function main(module, conf) {
	module = module.use.system.load(module);
	conf.window = window;
	let app = module.create("/ui/app/App");
	app.start(conf);
	return module;
};
export default main(module, conf);

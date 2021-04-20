let frame;
export default function main(conf) {
	let sys = conf.system.sys;
	frame = sys.extend("/ui.youni.works/view/Frame", {
		window: window,
		events: conf.app.events,
		editors: conf.app.editors
	});
	frame.start(conf.app)
	initialize(conf.app);
}

function initialize(conf) {
	frame.open(frame.search + ".json", initializeApp);

	function initializeApp(msg) {
		let app = JSON.parse(msg.content);
		conf = frame.sys.extend(conf, app);
		initializeDocument(conf);
		frame.open(conf.typeSource, initializeTypes);
	}
	
	function initializeTypes(msg) {
		let types = JSON.parse(msg.content);
		conf.types = frame.sys.extend(null, types);
		frame.open(conf.dataSource, initializeData);
		frame.open(conf.diagram, initializeDiagram)
	}
	
	function initializeDiagram(msg) {
		let data = JSON.parse(msg.content);
		data = frame.sys.extend(null, data);
		let view = frame.create(conf.components.Diagram);
		frame.append(view);
		view.file = conf.diagram;
		view.view(data);
	}
	function initializeData(msg) {
		let data = JSON.parse(msg.content);
		data = frame.sys.extend(null, data);
		let view = frame.create(conf.components.Object, conf.types[conf.objectType]);
		frame.append(view);
		view.view(data);
	}
}

//import parse from "../devt/parser.mjs";
//console.log(JSON.stringify(parse(diagram), null, 2));

//function frame(window, events) {
//	if (!window.owner) {
//		let frame = this.sys.extend(this.use.Frame);
//		frame.start({
//			window: window,
//			events: events
//		});
//		window.owner = frame;
//	}
//	return window.owner;
//}


function initializeDocument(conf) {
	if (conf.icon) link.call(frame, {
		rel: "icon",
		href: conf.icon
	});
	if (conf.styles) link.call(frame, {
		rel: "stylesheet",
		href: conf.styles
	});
}

function link(conf) {
	let ele = this.createNode("link");
	for (let attr in conf) {
		ele.setAttribute(attr, conf[attr]);
	}
	this.peer.ownerDocument.head.append(ele);
}

//this.window.styles = createStyleSheet(this.window.document);
//createRule: function(selector, properties) {
//	let out = `${selector} {\n`;
//	out += defineStyleProperties(properties);
//	out += "\n}";
//	let index = this.window.styles.insertRule(out);
//	return this.window.styles.cssRules[index];
//},

function createStyleSheet(document) {
	let ele = document.createElement("style");
	ele.type = "text/css";
	document.head.appendChild(ele);
	return ele.sheet;
}

function defineStyleProperties(object, prefix) {
	if (!prefix) prefix = "";
	let out = "";
	for (let name in object) {
		let value = object[name];
		if (typeof value == "object") {
			out += defineStyleProperties(value, prefix + name + "-");
		} else {
			out += "\t" + prefix + name + ": " + value + ";\n"
		}
	}
	return out;
}

let frame;
export default function main(sys, conf) {
	conf = sys.load(conf);
	frame = sys.extend(sys.forName("youni.works/view/Frame"), {
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
		view.file = conf.diagram;
		frame.append(view);
		view.draw(data);
	}
	function initializeData(msg) {
		let data = JSON.parse(msg.content);
		data = frame.sys.extend(null, data);
		let view = frame.create(conf.components.Object);
		view.start(conf.types[conf.objectType]);
		frame.append(view);
		view.draw(data);
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
	if (conf.icon) link.call(this, {
		rel: "icon",
		href: conf.icon
	});
	if (conf.styles) link.call(this, {
		rel: "stylesheet",
		href: conf.styles
	});
}

function link(conf) {
	let ele = this.createNode("link");
	for (let attr in conf) {
		ele.setAttribute(attr, link[attr]);
	}
	doc.head.append(ele);
}
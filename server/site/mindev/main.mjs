export default function main(sys, conf) {
	conf = sys.load(conf);
	let frame = sys.extend(sys.forName("youni.works/view/Frame"), {
		window: window,
		events: conf.app.events
	});
	frame.start(conf.app)
	initialize(frame, conf.app);
}

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

/*
	components: {
		Frame: view.Frame,
		Diagram: diagram.Diagram,
		Form: grid.Record
	}

*/
//import parse from "../devt/parser.mjs";
//console.log(JSON.stringify(parse(diagram), null, 2));

//app: {
//	type$: "use.view.Application",
//	use: {
//		type$Frame: "use.view.Frame",
//		type$Diagram: "use.diagram.Diagram",
//		type$Record: "use.grid.Record"
//	},
//	initialize: initialize
//},
//conf: {
//	frame: {
//		events: events
//	},
//	window: window
//}
//
//get$components: function() {
//	return this.app.components;
//},
//type$app: "Application",

function initialize(frame, conf) {
	frame.open(frame.search + ".json", initializeApp);

	function initializeApp(msg) {
		let app = JSON.parse(msg.content);
		conf = frame.sys.extend(conf, app);
		frame.open(conf.typeSource, initializeTypes);
	}
	
	function initializeTypes(msg) {
		let types = JSON.parse(msg.content);
		conf.types = frame.sys.extend(types);
		frame.open(conf.dataSource, initializeData);
		frame.open(conf.diagram, initializeDiagram)
	}
	
	function initializeDiagram(msg) {
		let data = JSON.parse(msg.content);
		data = frame.sys.extend(null, data);
		let view = frame.create(conf.components.Diagram);
		view.file = conf.diagram;
		frame.content.append(view.view);
		view.draw(data);
	}
	function initializeData(msg) {
		let data = JSON.parse(msg.content);
		data = frame.sys.extend(null, data);
	//	let view = frame.create(conf.components.Object);
	//	view.start(conf.types[conf.objectType]);
	//	frame.content.view(data, conf.objectType);
	}
}

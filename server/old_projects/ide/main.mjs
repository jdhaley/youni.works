export default function main(sys, conf) {
	conf = sys.load(conf);
	let frame = conf.use.Frame.control(window, conf);
	testGrids(frame);
	
	testNew(frame);
}

function testNew(frame) {
	
}
function testGrids(frame) {
	const sys = frame.sys;
	const conf = frame.conf;
	
	let app = conf.use.Application.createView(document.body);
	
	app.path = "/file/ide/data.json";
	app.confPath = "/file/ide/types.json";
	app.controller.open(app.confPath, loadTypes);
	app.controller.open("/file/ide/packages.json", loadPackages);
	
	function loadPackages(msg) {
		app.controller.show(app, "Package", JSON.parse(msg.content));
	}

	function loadTypes(msg) {
		app.controller.open(app.path, loadData)
		app.conf = sys.extend(null, JSON.parse(msg.content));
		app.types = app.conf.types;
		app.controller.show(app, "MetaModel", app.conf);

	}
	function loadData(msg) {
		app.model = sys.extend(null, JSON.parse(msg.content));
	}

}
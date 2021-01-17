export default function main(sys, conf) {
	conf = sys.load(conf);
//	let frame = conf.use.Frame.control(window, conf);
//	
//	let app = conf.use.Application.createView(document.body);
//	
//	app.path = "/file/stamp/data2.json";
//	app.confPath = "/file/stamp/types.json";
//	app.controller.open(app.confPath, loadTypes);
//	app.controller.open("/file/ide/packages.json", loadPackages);
	let context = conf.context;
	context.open("/file/stamp/data2.json", loadData);
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
		let data = JSON.parse(msg.content);
		console.log(data);
		context.view(document.body, "album", data);
		
//		app.model = sys.extend(null, JSON.parse(msg.content));
//		app.controller.show(app, "Album", app.model);
//		conf.use.Album.createView(app, undefined, app.model);

	}
}
export default function main(sys, conf) {
	conf = sys.load(conf);
	let app = conf.app;
	app.open(app.conf.typeSource, initializeApp);

	function initializeApp(msg) {
		let conf = JSON.parse(msg.content);
		conf = sys.extend(null, conf);
		app.initialize(conf);
		app.open(app.conf.dataSource, initializeView);
	}
	function initializeView(msg) {
		let data = JSON.parse(msg.content);
		data = sys.extend(null, data);		
		app.mainFrame.display(data, app.conf.objectType);
	}
}
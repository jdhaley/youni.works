export default function main(sys, conf) {
	conf = sys.load(conf);
	let app = conf.app;
	app.open(app.conf.typeSource, loadConf);

	function loadConf(msg) {
		app.initialize(JSON.parse(msg.content));
		app.open(app.conf.dataSource, loadData);
	}
	function loadData(msg) {
		let data = JSON.parse(msg.content);
		app.view(document.body, app.conf.dataType, data);
	}
}
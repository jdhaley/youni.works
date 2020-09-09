import model from "./conf/testModel.mjs";
export default function main(sys, conf) {
//	pkg.app.Application.save("/file/stamp/testModel.json", model);
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	
	let app = pkg.app.Application.createView(document.body);

	pkg.app.Application.open("/file/stamp/types.json", loadTypes);
	
	function loadTypes(msg) {
		app.types = JSON.parse(msg.content);
		app.controller.open("/file/stamp/data.json", loadData)
	}
	function loadData(msg) {
		let data = JSON.parse(msg.content)
		pkg.app.DataWindow.show(app, "Variety", data.issues[0].varieties);
		pkg.app.DataWindow.show(app, "Variety", data.issues[0].varieties[0]);
	}
}
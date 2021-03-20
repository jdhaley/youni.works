export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	document.types = conf.types;
	pkg.layout.Album.createView(document.body, conf.model);

	pkg.item.DataWindow.show(document.body, {
		type: "Printing"
	}, conf.model.issues[0].printings);
	pkg.item.DataWindow.show(document.body, {
		type: "Printing"
	}, conf.model.issues[0].printings[0]);
	testLoad(sys, conf);
//	let printing = sys.extend(pkg.control.Record, {
//		fields: conf.types["Printing"]
//	});
//	let printings = sys.extend(pkg.control.Table, {
//		record: printing
//	});
//	let win = pkg.item.Window.createView(document.body);
//	printings.createView(win.body, conf.model.issues[0].printings);
}

function testLoad(sys, conf) {
	
	let target = conf.packages.loader.Compiler.compile(conf.testLoader, "/test");
	console.log(target);
}
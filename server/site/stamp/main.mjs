export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	document.types = conf.types;
	const pkg = conf.packages;
	pkg.layout.Album.createView(document.body, conf.model);

	pkg.item.TableWindow.show(document.body, {
		type: "Printing"
	}, conf.model.issues[0].printings);
//	let printing = sys.extend(pkg.control.Record, {
//		fields: conf.types["Printing"]
//	});
//	let printings = sys.extend(pkg.control.Table, {
//		record: printing
//	});
//	let win = pkg.item.Window.createView(document.body);
//	printings.createView(win.body, conf.model.issues[0].printings);
}

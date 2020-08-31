export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	document.types = conf.types;
	const pkg = conf.packages;
	pkg.layout.Album.view(document.body, conf.model);

	let printing = sys.extend(pkg.control.Record, {
		fields: conf.types["Printing"]
	});
	let printings = sys.extend(pkg.control.Table, {
		record: printing
	});
	let win = pkg.item.Window.view(document.body);
	printings.view(win.body, conf.model.issues[0].printings);
}

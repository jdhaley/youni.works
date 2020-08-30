export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	document.types = conf.types;
	const pkg = conf.packages;
	pkg.layout.Album.view(document.body, conf.model);
	let item = pkg.control.Item.view(document.body);
	item.className = "window";
	item.header.innerHTML = "Window";
}

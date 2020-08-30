export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	pkg.layout.Album.view(document.body, pkg.model);
	let item = pkg.control.Item.view(document.body);
	item.header.innerHTML = "Window";
}

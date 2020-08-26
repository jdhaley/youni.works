export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	pkg.layout.Album.draw(document.body, pkg.model);
}

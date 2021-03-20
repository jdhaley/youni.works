export default function main(sys, conf) {
	conf = sys.load(conf);
	let app = conf.app;
	app.initialize(conf.conf);
}
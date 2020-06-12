export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);
	const frame = sys.extend(pkg.view.Frame, {
		window: window,
		part: pkg.parts.public,
		service: pkg.services.public,
	});
	frame.receive(conf);
	console.info(frame);
	frame.receive("open");
	
	return frame;
}
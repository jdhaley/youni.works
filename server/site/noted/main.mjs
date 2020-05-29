export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);
	const frame = sys.extend(pkg.ui.Frame, {
		window: window,
		part: pkg.parts.public,
		service: pkg.services.public,
	});
	conf.action = "initialize";
	conf[Symbol.Signal] = "Call";
	frame.receive(conf);
	console.info(frame);
	frame.activate();
	
	return frame;
}
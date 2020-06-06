export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);

	const frame = sys.extend(pkg.ui.Frame, {
		window: window,
		service: pkg.services.public,
		part: pkg.parts.public
	});
	
	conf.action = "initialize";
	frame.send(frame, conf);
	
	console.info(frame);
	frame.activate();
	frame.send(frame.view.control, "draw");

	return frame;
}
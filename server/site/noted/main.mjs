export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);
	const frame = sys.extend(pkg.view.Frame, {
		window: window,
		part: pkg.parts.public,
		service: pkg.services.public,
		
		sensor: conf.platform.sensors,
		render: conf.platform.renders,
		device: conf.platform.devices
	});
	frame.receive(conf);
	console.info(frame);
	frame.receive("draw");
	
	return frame;
}
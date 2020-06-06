export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);

	const frame = sys.extend(pkg.ui.Frame, {
		service: pkg.services.public,
		part: pkg.parts.public,
		
		sense: conf.platform.sensors,
		render: conf.platform.renders,
		device: conf.platform.devices
	});
	
	conf.action = "initialize";
	frame.send(frame, conf);
	console.info(frame);
	frame.activate();

	return frame;
}
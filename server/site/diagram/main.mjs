export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);

	const frame = sys.extend(pkg.view.Frame, {
		service: pkg.services.public,
		part: pkg.parts.public,
		
		sensor: conf.platform.sensors,
		render: conf.platform.renders,
		device: conf.platform.devices
	});
	
	frame.receive(conf);
	frame.receive("draw");
	frame.receive("activate");
	return frame;
}
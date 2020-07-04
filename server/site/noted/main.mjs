export default function main(sys, conf) {
	const pkg = sys.load(conf.packages);
	const frame = sys.extend(pkg.view.Frame, {
		sensor: conf.platform.sensors,
		device: conf.platform.devices,
		
		part: pkg.parts.public,
		service: pkg.services.public,
		render: conf.platform.renders
	});
	frame.receive(conf);
	frame.receive("draw");
	frame.receive("activate");
	
	return frame;
}
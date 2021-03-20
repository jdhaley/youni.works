export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;

	const frame = sys.extend(pkg.ui.Frame, {
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
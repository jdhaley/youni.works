export default function main(sys, conf) {
	conf.packages = sys.load(conf.packages);
	const pkg = conf.packages;
	const frame = sys.extend(pkg.ui.Frame, {
		sensor: conf.platform.sensors,
		device: conf.platform.devices,
		
		part: pkg.parts.public,
		render: conf.platform.renders
	});
	frame.receive(conf);
	frame.receive("draw");
	frame.receive("activate");
	
	return frame;
}
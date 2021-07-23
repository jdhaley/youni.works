export default function main(module, conf) {
	module = module.use.system.load(module);
	let service = module.create(conf.service);
	service = service.start();
	const credentials = {
		key: fs.readFileSync(conf.key),
		cert: fs.readFileSync(conf.cert)
	};
	const httpsServer = https.createServer(credentials, service);
	httpsServer.listen(conf.port, () => console.log(`Service "${module.name}" listening on HTTPS port "${conf.port}"`));
	return httpsServer;
}
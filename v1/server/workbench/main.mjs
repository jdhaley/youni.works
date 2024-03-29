import fs		from "fs";
import { Server } from "socket.io";
import https	from "https";
import express 	from "express";
import loader 		from "./loader.mjs";

export default function main(conf) {
	let module = conf.compiler;
	let compiler = module.create({
		type$: "/compiler/ModuleCompiler",
		context: "../..",
		fs: fs
	});
	compiler.load("source");

	const credentials = {
		key: fs.readFileSync(conf.key),
		cert: fs.readFileSync(conf.cert)
	};

	let service = conf.service.start({
		engine: express,
		fs: fs,
		// https: https,
		// server: {
		// 	credentials: credentials,
		// 	port: conf.port
		// }
	});
	service.engine.use("/sources", loader("../../source"));
	const httpsServer = https.createServer(credentials, service.engine);
	httpsServer.listen(conf.port, () => console.info(`Service listening on HTTPS port "${conf.port}"`));

	service.io = new Server(httpsServer, {
		// ...
	});
	
	service.io.on('connection', socket => {
		console.log("New connection");

		socket.on('receive', data => {
			console.log("Receive:", data);
		});
	});
}

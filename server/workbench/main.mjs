import fs		from "fs";
import { Server } from "socket.io";
import https	from "https";
import express 	from "express";

export default function main(conf) {
	let service = conf.service.start({
		engine: express,
		fs: fs
	});
	const credentials = {
		key: fs.readFileSync(conf.key),
		cert: fs.readFileSync(conf.cert)
	};
	const httpsServer = https.createServer(credentials, service);
	let info = `Service listening on HTTPS port "${conf.port}"`;
	httpsServer.listen(conf.port, () => console.info(info));

	const io = new Server(httpsServer, {
		// ...
	});
	  
	io.on('connection', socket => {
		console.log("New connection");

		socket.on('receive', data => {
			console.log("Receive:", data);
		});
	});
}

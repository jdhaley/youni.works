import fs		from "fs";
import https	from "https";
import conf		from "./conf.mjs";

main(conf);

function main(conf) {
	let module = conf.compiler;
	let compiler = module.create({
		type$: "/compiler/ModuleCompiler",
		context: fs.realpathSync("../.."),
		fs: fs
	});
	compiler.load("source");

	const httpsServer = https.createServer();
	let info = `Compiler listening on HTTPS port "${conf.port}"`;
	httpsServer.listen(conf.port, () => console.info(info));
};
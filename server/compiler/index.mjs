import fs		from "fs";
import fsp		from "fs/promises";
import https	from "https";
import express 	from "express";
import conf		from "./conf.mjs";

main(conf);

function main(conf) {
	let module = conf.compiler;
	let compiler = module.create({
		type$: "/compiler/ModuleCompiler",
		fs: fsp
	});
	compiler.load("../../source");

	const httpsServer = https.createServer();
	let info = `Compiler listening on HTTPS port "${conf.port}"`;
	httpsServer.listen(conf.port, () => console.info(info));
};
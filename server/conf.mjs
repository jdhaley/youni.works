import express		from "express";
import fs			from "fs";
import https		from "https";
//import base			from "./site/base/index.mjs";

export default {
//	sys: base.sys,
	module: {
		id: "server.youni.works",
		version: "0.0.1",
		moduleType: "system",
//		uses: [base]
	},
	node_modules: {
		express: express,
		fs: fs,
		https: https
	},
	port: 443,
	key: "ssl/my.key",
	cert: "ssl/my.crt",
	
	OLD_files: "/web/repositories/fs/fs/",
	files: "fs",
	site: "site"
}
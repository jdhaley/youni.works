import express		from "express";
import fs			from "fs";
import https		from "https";
import system		from "./site/system/index.mjs";

export default {
	sys: system.sys,
	module: {
		id: "server.youni.works",
		version: "1",
		moduleType: "system",
		uses: [system]
	},
	port: 443,
	key: "ssl/my.key",
	cert: "ssl/my.crt",
	OLD_files: "/web/repositories/fs/fs/",
	files: "fs",
	site: "site",
	node_modules: {
		express: express,
		fs: fs,
		https: https
	}
}
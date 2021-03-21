import express		from "express";
import fs			from "fs";
import https		from "https";

export default {
	port: 443,
	key: "ssl/my.key",
	cert: "ssl/my.crt",
	OLD_files: "/web/repositories/fs/fs/",
	files: "fs",
	site: "site",
	packages: {
		express: express,
		fs: fs,
		https: https
	}
}
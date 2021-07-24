import service	from "../../target/test.service.youni.works-1.0.mjs";
import express 	from "express";

export default {
	port: 8080,
    key: "conf/server.key",
	cert: "conf/server.crt",
	engine: express,
	service: service
}
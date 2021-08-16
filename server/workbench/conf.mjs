import service	from "../../target/workbench.youni.works-1.0.mjs";
import compiler	from "../../target/compiler.youni.works-1.0.mjs";

export default {
	port: 8080,
    key: "conf/server.key",
	cert: "conf/server.crt",
	engine: "express",
	compiler: compiler,	
	service: service
}
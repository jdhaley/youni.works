import express 	from "express";
import fs		from "fs";
import https	from "https";

export default {
    modules: {
        fs: fs,
        https: https
    },
    port: 8080,
    key: "conf/server.key",
	cert: "conf/server.crt",
    service: {
        type$: "/service/Service",
        engine: express,
        endpoints: {
            test1: {
                type: "/service/Test",
                value: "one"
            },
            test2: {
                type: "/service/Test",
                value: "two"           
            }
        }
    }
}
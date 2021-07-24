export default {
    service: {
        type$: "/service/service/Service",
        engine: "express",
        endpoints: {
            "/app": "../framework/app",
            "/res": "../framework/res",
            "/target": "../../target",
            "/file": "../framework/fs",
            "/sources": "sources.txt",
            "/test1": {
                type$: "/service/service/Test",
                value: "one"
            },
            "/test2": {
                type$: "/service/service/Test",
                value: "two"           
            }
        }
    }
}
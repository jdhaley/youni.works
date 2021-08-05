export default {
    service: {
        type$: "/service/service/Service",
        engine: "express",
        endpoints: {
            "/workbench.html": "res/index.html",
            "/index.mjs": "../app.youni.works-1.1.mjs",
            "/module": "..",
            "/res": "res",
            "/sources": "static/sources.txt",
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
export default {
    service: {
        type$: "/service/service/Service",
        engine: "express",
        endpoints: {
            "/workbench.html": "static/workbench.html",
            "/module/index.mjs": "../../target/workbench-ui.youni.works-1.1.mjs",
            "/module": "../../target",
            "/res": "static/res",
            "/file": "static/fs",
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
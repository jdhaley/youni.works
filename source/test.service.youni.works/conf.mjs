export default {
    service: {
        type$: "/service/service/Service",
        engine: "express",
        endpoints: {
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
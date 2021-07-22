export default {
    type$: "/base/control",
    Request: {
        subject: "",
        content: undefined
    },
    Service: {
        category: "static",
        service(request) {
            
        },
        extend$actions: {
            get(event) {
            },
            put(event) {
            }
        }
    },
    FileService: {
        type$: "Service",
        path: ""
    }
}

import editors from "./conf/editors.mjs";
export default {
    type$: "/workbench/App",
    title: "Workbench",
    frame: {
        type$: "/ui/display/Frame",
        editors: editors,
        main: {
            type: "/workbench/Workbench",
            bodies: {
                test1: {
                    title: "",
                    icon: "/res/bag.svg",
                    body: {
                    }
                },
                test2: {
                    title: "",
                    icon: "/res/bag.svg",
                    body: {
                    }                   
                }
            }
        }
    },
    conf: {
        //window: null,
        type$events: "/ui/gdr",
        dataConverter: "/compiler/converter/Converter",
        "objectType": "Module",
        "dataset": "source",
        "dataSource": "/sources",
        "typeSource": "/file/workbench/types.json"        
    }
}
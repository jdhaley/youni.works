export default {
    name: "ui.youni.works",
    version: "1.1",
    moduleType: "library",
    use: {
        system: "system.youni.works-2.1",
        base: "base.youni.works-1.2",
        compiler: "compiler.youni.works-1.0", //TODO Remove after app/workbench refactored
        dom: "dom.youni.works-1.0"
    }
}
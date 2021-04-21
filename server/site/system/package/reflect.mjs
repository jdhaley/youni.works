export default {
	type$: "/system.youni.works/core",
	Interface: {
		type$: "Instance",
		id: "",
		type$module: "Module",
		type$instance: "Instance",
		type$extends: "Interface",
		type$implements: "Array", //of Interface
		type$properties: "Parcel" //of Declaration.
	},
	Property: {
		type$: "Instance",
		facet: "",
		name: "",
		expr: undefined
	},
	Module: {
		type$: "Instance",
		id: "",
		version: "",
		moduleType: "",
		type$uses: "Array",
		type$packages: "Parcel"
	}
}
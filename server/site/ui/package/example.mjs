export default {
	type$: "/base.youni.works/component",
	A: {
		type$: "",
		x: "x"
	},
	B: {
		type$: "",
		y: "y"
	},
	Test: {
		type$: ["Instance", "A", "B"]
	},
	Example: {
		type$: "Component",
		type$twin: "Example",
		x: 3,
		y: 1,
		get$area: function() {
			return this.x * this.y || 0;
		},
		once$total: function() {
			return this.area + this.twin.area;
		}
	}
}
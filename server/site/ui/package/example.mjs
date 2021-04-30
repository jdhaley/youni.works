export default {
	type$: "/base.youni.works/component",
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
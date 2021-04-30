export default {
	type$: "/base.youni.works/component",
	type$Remote: "/base.youni.works/util/Remote",
	Example: {
		type$: "Component",
		x: 0,
		y: 0,
		get$area: function() {
			return this.x * this.y || 0;
		}
	}
}
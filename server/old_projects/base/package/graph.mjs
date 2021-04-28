export default {
	package$: "youni.works/base/graph",
	use: {
		package$control: "youni.works/base/control"
	},
	Box: {
		super$: "use.control.Control",
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		size: function(width, height) {
			this.x += (width - this.width) / 2;
			this.y += (height - this.height) / 2;
			this.sys.define(this, "width", width);
			this.sys.define(this, "height", height);
			return this;
		},
		virtual$top: function() {
			if (arguments.length) {
				this.y = arguments[0] * 1 + this.height / 2;
				return;
			}
			return this.y - this.height / 2;
		},
		virtual$right: function() {
			if (arguments.length) {
				this.x = arguments[0] * 1 - this.width / 2;
				return;
			}
			return this.x + this.width / 2;
		},
		virtual$bottom: function() {
			if (arguments.length) {
				this.y = arguments[0] * 1 - this.height / 2;
				return;
			}
			return this.y + this.height / 2;
		},
		virtual$left: function() {
			if (arguments.length) {
				this.x = arguments[0] * 1 + this.width / 2;
				return;
			}
			return this.x - this.width / 2;
		}
	},
	Node: {
		super$: "Box",
		type$graph: "Node",
		type: "",
		entity: "",
		id: 0,
		arc: null,
//		command: {
//			create: function(object) {
//				let node = this.sys.extend(this, object);
//				this.command.
//				{
//					graph: graph,
//					width: width,
//					height: height
//				})
//			}
//		}
	},
	Arc: {
		super$: "use.control.Control",
		type: "",
		type$from: "Node",
		type$to: "Node",
		index: 0,
		get$offset: function() {
			let offset = this.index % 2 ? (this.index + 1) * -1 : this.index;
			return offset * 10;
		},
		get$fromX: function() {
			return this.from.x + this.offset;
		},
		get$fromY: function() {
			return this.from.y < this.to.y ? this.from.bottom : this.from.top;
		},
		get$toX: function() {
			return this.to.x + this.offset;
		},
		get$toY: function() {
			return this.from.y < this.to.y ? this.to.top : this.to.bottom;
		},
		get$top: function() {
			return this.from.top < this.to.top ? this.from.top : this.to.top;
		},
		get$bottom: function() {
			return this.from.bottom > this.to.bottom ? this.from.bottom : this.to.bottom;			
		},
		get$left: function() {
			return this.from.left < this.to.left ? this.from.left : this.to.left;
		},
		get$right: function() {
			return this.from.right > this.to.right ? this.from.right : this.to.right;			
		},
		get$width: function() {
			return this.right - this.left;			
		},
		get$height: function() {
			return this.bottom - this.top;			
		},
		get$x: function() {
			return this.left + this.width / 2;			
		},
		get$y: function() {
			return this.top + this.height / 2;	
		}
	},
	Entity: {
		uuid: "",
		title: ""
	}
}
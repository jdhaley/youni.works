export default {
	package$: "youni.works/base/graph",
	Command: {
		
	},
	Box: {
		super$: "Object",
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		size: function(width, height) {
			this.x += (width - this.width) / 2;
			this.y += (height - this.height) / 2;
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
		super$: "Object",
		type: "",
		type$from: "Node",
		type$to: "Node",
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
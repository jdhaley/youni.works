export default {
	package$: "youni.works/diagram/diagram",
	use: {
		package$graphic: "youni.works/web/graphic"
	},
	type$Graphic: "use.graphic.Graphic",
	Connector: {
		super$: "Graphic",
		viewName: "line",
		create: function(gc, from, to) {
			let con = this.view();
			con.connector = true;
			con.setAttribute("x1", from.getAttribute("x") * 1 + from.getAttribute("width") / 2);
			con.setAttribute("y1", from.getAttribute("y") * 1 + from.getAttribute("height") / 2);
			con.setAttribute("x2", to.getAttribute("x") * 1 + to.getAttribute("width") / 2);
			con.setAttribute("y2", to.getAttribute("y") * 1 + to.getAttribute("height") / 2);
			con.setAttribute("stroke", this.stroke);
			this.control(con);
			gc.append(con);

			return con;										
		},
		arc: function(con, x, y) {
			con.setAttribute("x2", x);
			con.setAttribute("y2", y);
			return con;										
		}			
	},
	Group: {
		super$: "Graphic",
		viewName: "rect",
		create: function(gc, x, y) {
			let cell = gc.controller.cellSize;
			let grp = this.view();
			grp.handle = true;
			x -= x % cell;
			y -= y % cell;
			grp.setAttribute("x", x - this.width / 2);
			grp.setAttribute("y", y - this.height / 2);
			grp.setAttribute("width", this.width);
			grp.setAttribute("height", this.height);
			///
			grp.setAttribute("fill", this.fill);
			grp.setAttribute("stroke", this.stroke);
			grp.setAttribute("stroke-dasharray", this.strokeDasharray);
			this.control(grp);
			gc.append(grp);
			return grp;										
		},
		move: function(group, x, y) {
			let gc = group.parentNode.controller;
			let cell = gc.cellSize;
			x = x - x % cell;
			y = y - y % cell;
			x = x - group.getAttribute("width") / 2;
			y = y - group.getAttribute("height") / 2;
			console.log(x, y);
			group.setAttribute("x", x);
			group.setAttribute("y", y);		
		}
	}
}
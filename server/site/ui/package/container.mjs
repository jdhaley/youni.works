export default {
	type$: "/ui.youni.works/view",
	Component: {
		type$: "View",
		parts: {
		},
		display: function() {
			this.super("display");
			this.displayParts();
		},
		displayParts: function() {
			for (let name in this.parts) {
				let part = this.owner.create(this.parts[name], this.conf);
				part.peer.classList.add(name);
				this.sys.define(part, "of", this);
				this.sys.define(this.parts, name, part);
			}
		}
	},
	Container: {
		type$: "View",
		use: {
			type$Header: "View",
			type$Body: "View",
			type$Footer: "View"      
		},
		conf: {
			name: "Object",
			properties: []
		},
        var$header: null,
        var$body: null,
        var$footer: null,
		display: function() {
			this.dc();
		},
		dc: function() {
			this.peer.classList.add(this[Symbol.toStringTag]);
			this.header = this.owner.create(this.use.Header, this.conf);
			this.append(this.header);
			this.body = this.owner.create(this.use.Body, this.conf);
			this.append(this.body);
			this.footer = this.owner.create(this.use.Footer, this.conf);
			this.append(this.footer);
		},
		bind: function(object) {
			this.body.bind(object);
		}
	},
}
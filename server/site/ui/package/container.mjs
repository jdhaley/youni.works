export default {
	type$: "/ui.youni.works/view",
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
	Body: {
		type$: ["View", "Observer"],
		use: {
			type$Content: "View",
		},
		bind: function(model) {
			this.unobserve(this.model);
			this.observe(model);
			this.model = model;
			this.peer.textContent = "";
			for (let i = 0; i < model.length; i++) {
				let content = this.owner.create(this.use.Content, this.conf);
				this.append(content);
				content.bind(model[i]);
			}
		}
	}
}
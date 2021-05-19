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
			this.super("display");
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
	}
}
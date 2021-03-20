export default {
	package$: "youni.works/view",
	use: {
		package$control: "youni.works/control",
		package$util: "youni.works/util"
	},
	Application: {
		super$: "Object",
		type$remote: "use.util.Remote",
		type$mainFrame: "Frame",
		components: null,
		propertyType: null,
		events: null,
		conf: null,
		frame: function(window) {
			if (!window.owner) {
				window.owner = this.sys.extend(this.use.Frame, {
					app: this,
					window: window
				});
				window.owner.initialize();
			}
			return window.owner;
		},
		open: function(pathname, receiver) {
			this.remote.service(receiver, "opened", {
				url: pathname,
				method: "GET"
			});
		},
		save: function(pathname, content, receiver) {
			this.remote.service(receiver, "saved", {
				url: pathname,
				content: content,
				method: "PUT"
			});
		},
		initialize: function(conf) {
			console.log(this);
			this.sys.define(this, "events", conf.events);
			this.sys.define(this, "mainFrame", this.frame(conf.window));
			this.open(this.mainFrame.search + ".json", initializeApp);
			let app = this;
			function initializeApp(msg) {
				let conf = JSON.parse(msg.content);
				conf = app.sys.extend(null, conf);
				app.sys.define(app, "conf", conf);
				app.open(conf.typeSource, initializeTypes);
			}
			function initializeTypes(msg) {
				let components = JSON.parse(msg.content);
				app.sys.define(app, "components", app.sys.extend());
				for (let conf of components) {
					app.components[conf.name] = app.createController(conf);
				}
			//	app.open(app.conf.dataSource, initializeData);
				app.open(app.conf.diagram, initializeDiagram)
			}
			function initializeDiagram(msg) {
				let data = JSON.parse(msg.content);
				data = app.sys.extend(null, data);
				let view = app.mainFrame.create("youni.works/diagram/Diagram");
				view.file = app.conf.diagram;
				app.mainFrame.content.append(view.view);
				view.draw(data);
			}
			function initializeData(msg) {
				let data = JSON.parse(msg.content);
				data = app.sys.extend(null, data);
				app.mainFrame.content.view(data, app.conf.objectType);
			}
		},
		createController: function(conf, defaultType) {
//			conf = this.sys.extend(null, conf);
//			let controller = this.forName(conf.type) || defaultType || this.use.Component;
//			controller = this.sys.extend(controller, {
//				app: this,
//				conf: conf
//			});
//			conf.type = controller;
//			controller.initialize();
//			return controller;
		}
	}
}
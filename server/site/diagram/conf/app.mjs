export default {
	package$: "youni.works/diagram/parts",
	use: {
		package$view: "youni.works/web/view",
		package$ui: "youni.works/web/ui",
		package$component: "youni.works/diagram/component",
	},
	public: {
		body: {
			type$: "use.view.Viewer",
			viewName: "body",
			viewType: "composite",
			part: {
				main: {
					type$: "use.ui.Main",
					part: {
						ribbon: {
							type$: "use.ui.Ribbon",
							viewName: "nav"
						},
						type$article: "use.component.component"
					},
					extend$shortcut: {
					},
					control: function(view) {
						this.super("control", view);
						view.sense("event", "KeyDown");
						view.sense("event", "Input");
						view.sense("event", "FocusOut");
						view.sense("event", "Click");
						view.sense("event", "DblClick");
						view.sense("event", "MouseDown");
						view.sense("event", "MouseUp");
						view.sense("event", "MouseMove");
					},
					extend$action: {
						loadNew: function(on, message) {
							let view = on.parts.article;
							view.innerHTML = this.part.article.template;
							on.owner.window.document.title += " (New)";
						}
					}
				}
			}
		}
	}
}

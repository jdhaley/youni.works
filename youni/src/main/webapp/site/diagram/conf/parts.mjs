export default {
	package$: "youni.works/diagram",
	package$ui: "youni.works/ui",
	package$editor: "youni.works/diagram/editor",
	public: {
		Editor: {
			type$: "editor.Editor",
			controlName: "main",
			part: {
				ribbon: {
					type$: "ui.Viewer",
					controlName: "nav",
					draw: function() {
						//TODO the default viewer draws on a model.  The ribbon isn't a model view but a component.
					}
				},
				body: {
					type$: "ui.Viewer",
					controlName: "article"
				}
			},
			extend$shortcut: {
			},
			extend$action: {
			}
		}
	}
}
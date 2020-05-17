export default {
	package$: "youni.works/noted",
	package$ui: "youni.works/ui",
	package$editor: "youni.works/editor",
	public: {
		Editor: {
			type$: "editor.Editor",
			command: {
				type$Edit: "editor.Edit"
			},
			part: {
				ribbon: {
					type$: "editor.Ribbon",
					controlName: "nav",
					buttons: {
						Save: {
							"title": "Save",
							"shortcut": "Control+S",
							"icon": "save.png"					
						},
						Strong: {
							"title": "Strong",
							"shortcut": "Control+B",
							"icon": "bold.gif"
						},
						Emphasis: {
							"title": "Emphasis",
							"shortcut": "Control+I",
							"icon": "italic.gif"
						},
						Term: {
							"title": "Term",
							"shortcut": "Control+U",
							"icon": "underline.gif"
						},
						Heading: {
							"title": "Heading",
							"icon": "heading.png"
						},
						Items: {
							"title": "Items",
							"icon": "dottedlist.gif"
						},
						List: {
							"title": "List",
							"shortcut": "Control+L",
							"icon": "numberedlist.gif"
						},
						Promote: {
							"title": "Promote",
							"shortcut": "Control+Backspace",
							"icon": "outdent.gif"
						},
						Demote: {
							"title": "Demote",
							"shortcut": "Control+Space",
							"icon": "indent.gif"
						}
					}
				},
				body: {
					type$: "ui.Viewer",
					controlName: "article"
				}
			}
		}
	}
}
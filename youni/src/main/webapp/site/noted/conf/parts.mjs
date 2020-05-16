export default {
	package$: "youni.works/noted",
	package$ui: "youniworks.com/ui",
	package$editor: "youniworks.com/editor",
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
						Bold: {
							"title": "Bold",
							"shortcut": "Control+B",
							"icon": "bold.gif"
						},
						Italic: {
							"title": "Italic",
							"shortcut": "Control+I",
							"icon": "italic.gif"
						},
						Underline: {
							"title": "Underline",
							"shortcut": "Control+U",
							"icon": "underline.gif"
						},
						UnorderedList: {
							"title": "Bullets",
							"icon": "dottedlist.gif"
						},
						OrderedList: {
							"title": "Numbered list",
							"shortcut": "Control+L",
							"icon": "numberedlist.gif"
						},
						Heading: {
							"title": "Heading",
							"icon": "heading.png"
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
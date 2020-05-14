export default {
	package$: "test/controllers",
	package$ui: "youniworks.com/ui",
	package$editor: "youniworks.com/editor",
	public: {
		Editor: {
			type$: "editor.Editor",
			part: {
				ribbon: {
					type$: "editor.Ribbon",
					controlName: "nav"
				},
				body: {
					type$: "ui.Viewer",
					controlName: "article"
				}
			},
			commands: {
				Save: {
					"title": "Save",
					"shortcut": "Control+S",
					"image": "icons/save.png"					
				},
				Bold: {
					"title": "Bold",
					"shortcut": "Control+B",
					"image": "icons/bold.gif"
				},
				Italic: {
					"title": "Italic",
					"shortcut": "Control+I",
					"image": "icons/italic.gif"
				},
				Underline: {
					"title": "Underline",
					"shortcut": "Control+U",
					"image": "icons/underline.gif"
				},
				UnorderedList: {
					"title": "Bullets",
					"image": "icons/dottedlist.gif"
				},
				OrderedList: {
					"title": "Numbered list",
					"shortcut": "Control+L",
					"image": "icons/numberedlist.gif"
				},
				Heading: {
					"title": "Heading",
					"image": "icons/heading.png"
				},
				Promote: {
					"title": "Promote",
					"shortcut": "Control+Backspace",
					"image": "icons/outdent.gif"
				},
				Demote: {
					"title": "Demote",
					"shortcut": "Control+Space",
					"image": "icons/indent.gif"
				}
			}
		}
	}
}
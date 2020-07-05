export default {
	Node: {
		part: {
			pathname: {
				type: "string",
				caption: "File Name"
			},
			uuid: {
				type: "string",
				caption: "Object Id"
			}
		}
	},
	Arc: {
		type: {
			type: "text",
			caption: "Type"
		},
		name: {
			type: "text",
			caption: "Name"
		},
		from: {
			type: ",
			caption: "From Node",
			editable: false
		},
		to: {
			type: "Node",
			caption: "To Node"	
		}
	}
}
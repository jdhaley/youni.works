export default {
	Field: [
		{
			name: "name",
		},
		{
			name: "type",
			choice: {
				string: "String",
				number: "Number",
				boolean: "Boolean",
				time: "Time",
				text: "Text"
			}
		},
		{
			name: "title",
			type: "text"
		},
		{
			name: "size",
			type: "number"
		}
	],
	Record: [
		{
			name: "name"
		},
		{
			name: "fields",
			type: "Field*"
		}
	]
}
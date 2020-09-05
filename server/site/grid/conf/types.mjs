export default {
	Field: [
		{
			name: "name",
		},
		{
			name: "type"
		},
		{
			name: "title"
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
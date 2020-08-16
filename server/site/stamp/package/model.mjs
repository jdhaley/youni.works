export default {
	[Region Set Variety Issue Minor]
	Region: {
		id: "",
		name: ""
	},
	Set: {
		type$region: "Region",
		id: "",
		varieties: [],
		issues: []
	},
	Design: {
		id: "",
		image: "",
		method: "typo litho overprint ..."
		//width height shape
	},
	Variety: {
		type$set: "Set",
		type$design: "Design",
		purpose: "",
		denom: "",
		color: "",
		subject: "",
		image: "",
		issues: []
	},
	Issue: {
		sequence: "", //{a, b1, b2, c}
		date: "",
		shade: "",
		media: null,
		printing: null
	}
}
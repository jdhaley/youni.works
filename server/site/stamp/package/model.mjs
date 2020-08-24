export default {
	Watermark: {
		id: "",
		image: ""
	},
	Region: {
		id: "",
		name: "",
		relatedRegions: {
			//region: relationship
		}
	},
	Era: {
		type$region: "Region",
		seq: 0,
		get$id: function() {
			return this.region.id + "-" + this.seq;
		},
		title: "",
		from: "0000-00-00",
		to: "000-00-00",
		currency: ""
	},
	Design: {
		type$era: "Era",
		seq: "", //A, B, ..., Z, AA, AB, ..., AAA, ...
		get$id: function() {
			return this.era.id + this.seq;
		},
		image: "",
		method: "typo litho overprint ..." //litho | typo, litho & engr
		relatedDesigns: {
			//design: relationship type
		}
		//width height shape
	},
	Variety: {
		type$design: "Design",
		seq: 0,
		get$id: function() {
			return this.design.id + this.seq;
		},
		purpose: "", //Postage & Charity, Postage | Revenue, 
		denom: "",
		color: "",
		subject: "",
		image: "",
		issues: []
	},
	Issue: {
		sequence: "", //{a, b1, b2, c}
		from: "0000-00-00",
		to: "0000-00-00",
		demonetized: "0000-00-00",
		shade: "",
		media: null,
		
	},
	Media: {
		paperType: "",
		watermark: "",
		tagging: "",
		rotated: false,
	},
	Product: {
		type: "", //sheet booklet coil souvenior ...
		description: "", //
		image: ""
	}
}
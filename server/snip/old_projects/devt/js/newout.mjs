{
	package: "youniw\"orks.com/test",
	package$parser: "youniworks.com/parser",
	public: {
		Person: {
			name: String,
			age: Number,
			likes: Sequence,
		},
		test: {
			name: "John Haley",
			age: +32.3e+4,
			likes: ["food", "air", "water", ERROR("<object><expr><word>x</word><op>+</op><string>&quot;code&quot;</string><op>+</op><number>32.4</number></expr></object>")],
		},
		get$location: (this, 35.9),
		valid: function(x) {
		},
		casetest: function(x, y) {
		},
	},
	private: function() {
	},
}
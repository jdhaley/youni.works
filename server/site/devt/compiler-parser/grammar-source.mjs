export default `
	lift$grammar: tokens ^ rules,
	lift$tokens: [ws comment text pn not number name]*,
	lift$rules: rule*,
	
	rule: (#name ":"#pn expr next* ","#pn),
	lift$expr: ([sequence choice term match call #text] #number?),
	next: ("^"#pn [#text #name]),
	
	sequence: ("("#pn expr* ")"#pn),
	choice: ("["#pn expr* "]"#pn),
	term: ("#"#pn #text),
	match: (#text? ("#"#pn #name)),
	call: (#not? #name),

	/* Tokens */
	token$pn: #"()[],:#^",
	token$number: #"?*!",
	token$not: #"~",
	token$text: (quote [(esc quote) ~quote]* quote) ^ stripQuotes,
	token$name: (lower [lower upper letterLike digit]*),
	none$ws: #" \t\r\n"*,
	none$comment: (commentStart ~commentEnd* commentEnd),

	/* Token terms */
	upper: #"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	lower: #"abcdefghijklmnopqrstuvwxyz",
	letterLike: #"$_",
	digit: #"0123456789",
	quote: #"\\\"",
	esc: #"\\\\",
		
	commentStart: (#"/" #"*"),
	commentEnd: (#"*" #"/"),
	
	/* Transforms */
	stripQuotes: "parser.strip",
`;
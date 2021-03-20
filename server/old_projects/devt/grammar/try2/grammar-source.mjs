export default `
	lift$grammar: [ws comment text pn not number name term]* ^ rules;
	lift$rules: rule*;
	
	rule: (#name ":"#pn expr next* ";"#pn);
	lift$expr: ([sequence choice match call #term  #text] #number?);
	next: ("^"#pn [#text #name]);
	
	sequence: ("("#pn expr* ")"#pn);
	choice: ("["#pn expr* "]"#pn);
	match: (#text? ("#"#pn #name));
	call: (#not? #name);

	/* Tokens */
	token$pn: '()[]:;#^';
	token$number: '?*!';
	token$not: '~';
	token$text: (quote [(esc quote) ~quote]* quote);
	token$term: (apos [(esc apos) ~apos]* apos);
	token$name: (lower [lower upper letterLike digit]*);
	none$ws: ' \t\r\n'*;
	none$comment: (commentStart ~commentEnd* commentEnd);

	/* Token terms */
	upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	lower: 'abcdefghijklmnopqrstuvwxyz';
	letterLike: '$_';
	digit: '0123456789';
	quote: '\"';
	esc: '\\\\';
	apos: '\\\'';

	commentStart: ('/' '*');
	commentEnd: ('*' '/');
`;
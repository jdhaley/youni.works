export default `
	lift$struct:	[#stmt #rcd],
	lift$x:			[#field #ele #expr],
	lift$value:		[#sequence #scope #collection #word #name #op #number #string #q #tt #bin #error],
	lift$constructs:[#fn #type #fnType #phrase #message #object #cast],
	
	lift$construct:	[fn type fnType phrase message object cast value]* ^ expr,
	fn:				(type? #sequence #scope phrase*),
	fnType:			(type #sequence),
	type:			((#word "."#op)* #name),
	path:			((#word "."#op)* #word),
	
	lift$ref:		[inc dec type path],
	inc:			([path type] "++"#op),
	dec:			([path type] "--"#op),

	phrase:			(#word #sequence? #scope),
	message:		(#word #sequence?),
	object:			(type* #scope),
	cast:			(type [#sequence #collection]),
	eval:			([constructs value] constructs!),
	
	expression:		(binary message*),
	arith:			[opers oper primary],
	opers:			([oper primary] oper*),
	oper:			(op! primary),
	lift$primary:	[([call value] ("."#op message)!) call value],
	call:			value #sequence!,
		lift$expr:		[assign binexpr],
	

	assign:			(#word ("."#op #word)* "="#op),
	unary:			(#op [call value]),
	call:			(value [("."#op #word) #sequence]!),
	
	lift$unyexpr:	[unary primary]
	lift$idxexpr:	(unyexpr idx*),
	lift$mulexpr:	(idxexpr mul*),
	lift$addexpr:	(mulexpr add*),

	lift$relexpr:	(addexpr rel*),
	lift$andexpr:	(relexpr and*),
	lift$orexpr:	(andexpr  or*),
	lift$binexpr:	(orexpr  let*),

	idx:			(idxop unyexpr),
	mul:			(mulop idxexpr),
	add:			(addop mulexpr),
	rel:			(relop addexpr),
	and:			(andop relexpr),
	or:				(orop  andexpr),
	let:			(letop  orexpr),

	idxop:			["#"#op "@"#op],
	mulop:			["*"#op "/"#op "%"#op],
	addop:			["+"#op "-"#op],
	relop:			[">"#op "<"#op ">="#op  "<="#op "=="#op "<>"#op],
	andop:			"and"#word,
	orop:			"or"#word,
	letop:			"="#op,
`;

/*
	unary primary binary* message*

	primary: value [.word seq]*
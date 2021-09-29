import asm from "/res/asm.mjs";

let code = "\
	; This is a simple test for parsing\n\
	loop:	r3 sub 12; do something\n\
			r4 set r3\n\
"
console.log(asm(code));
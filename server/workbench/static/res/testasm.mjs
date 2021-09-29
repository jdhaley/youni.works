import asm from "/res/asm.mjs";

let code = `
	; This is a simple test for parsing
	loop:	
		add r3 12; do something
		set r4 r3
`
console.log(asm(code));
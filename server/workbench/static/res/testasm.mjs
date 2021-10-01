import asm from "/res/asm.mjs";

let code = `
; This is a simple test for parsing
;Var
;	sum: 
;Code
loop:	
    add r3 12 x; do something
    not r2
    br r3 loop
    shunt r1 r2
exit:
    hlt
exit:
    end
`
console.log(asm(code));
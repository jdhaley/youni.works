import asm from "/res/asm.mjs";

let code = `
; This is a simple test for parsing
;Var
;	sum: 
;Code
loop:
    add r3 12 x; do something
    not r2
    jz r3 loop
    shunt r1 r2
exit:
    hlt
exit:
    end
`
let code1 = `
var: 7
max: 99
.CODE
    r5 set 6    ; loop starts at PC+6 (3 instructions * 2 halfwords)
    r2 set 99   ; the value must be less than 99.
loop:
    get r1 var  ; fetch the data into r1. It is externally set to 7.
    r1 add 13   ; add 13 to the value in r1.
    r0 put r1   ; put the r1 value into memory at r0.
    r1 sub r2   ;
    r5 bl r1    ; brach to loop if r1 < 99
    halt

    get r2 arr + 18
.DATA
    arr: 0*30
    x: 0
    y: 0

*/
`
let output = "䌑䈁䀀";
console.log(output.length, output);

let model = asm(code);
console.log(model);
document.body.innerHTML = model.code || "Error or Empty Source";

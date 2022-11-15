import { ELE } from "../base/dom";
import { BaseType } from "../base/type";
import { bundle } from "../base/util";

export class GenType extends BaseType<any> {
	declare types: bundle<GenType>;
	generate(target: ELE) {
		let ele = target.ownerDocument.createElement(this.conf.nodeName);
		target.append(ele);
		for (let name in this.types) {
			let type = this.types[name];
			type.generate(ele);
		}
	}
}
// 
// For example, this code written with JSX:

// class Hello extends React.Component {
//   render() {
//     return <div>Hello {this.props.toWhat}</div>;
//   }
// }

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<Hello toWhat="World" />);
// can be compiled to this code that does not use JSX:

// class Hello extends React.Component {
//   render() {
//     return React.createElement('div', null, `Hello ${this.props.toWhat}`);
//   }
// }

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(React.createElement(Hello, {toWhat: 'World'}, null));
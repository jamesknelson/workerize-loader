import { otherFoo, otherBar } from './other';

export { otherFoo };

function foo() {
	return 1;
}

function throwError() {
	throw new Error('Error in worker.js');
}

const bar = (a, b) => `${a} [bar:${otherBar}] ${b}`;

export { foo, throwError, bar }

interface BuiltinOp {
	name: string;
	description: string;
	fn: BuiltinFunc;
	numArgs: number;
	numReturns: number;
}

type BuiltinFunc = (stack: number[]) => void;

export const builtins: Record<string, BuiltinOp> = {};

function registerBuiltin(
	name: string,
	description: string,
	fn: BuiltinFunc,
	numArgs: number,
	numReturns: number
): void {
	builtins[name] = newBuiltin(name, description, fn, numArgs, numReturns);
}

registerBuiltin(
	'+',
	'Adds two numbers',
	adapt2_1((a, b) => a + b),
	2,
	1
);
registerBuiltin(
	'-',
	'Subtracts the number on the top of the stack from the number below it',
	adapt2_1((a, b) => a - b),
	2,
	1
);
registerBuiltin(
	'*',
	'Multiplies two numbers',
	adapt2_1((a, b) => a * b),
	2,
	1
);
registerBuiltin(
	'/',
	'Divides the number on the top of the stack by the number below it',
	adapt2_1((a, b) => a / b),
	2,
	1
);
registerBuiltin(
	'=',
	'Returns 1 if the two numbers are equal, 0 otherwise',
	adapt2_1((a, b) => boolToNum(a === b)),
	2,
	1
);
registerBuiltin(
	'!=',
	'Returns 1 if the two numbers are not equal, 0 otherwise',
	adapt2_1((a, b) => boolToNum(a !== b)),
	2,
	1
);
registerBuiltin(
	'<',
	'Returns 1 if the number on the top of the stack is less than the number below it, 0 otherwise',
	adapt2_1((a, b) => boolToNum(a < b)),
	2,
	1
);
registerBuiltin(
	'>',
	'Returns 1 if the number on the top of the stack is greater than the number below it, 0 otherwise',
	adapt2_1((a, b) => boolToNum(a > b)),
	2,
	1
);
registerBuiltin(
	'mod',
	'Returns the remainder of the division of the number on the top of the stack by the number below it',
	adapt2_1((a, b) => a % b),
	2,
	1
);
registerBuiltin(
	'rnd',
	'Returns a random number between 0 and 1',
	(stack: number[]) => stack.push(Math.random()),
	0,
	1
);
registerBuiltin(
	'rrng',
	'Returns a random number between the two numbers on the stack',
	adapt2_1((a, b) => Math.random() * (b - a) + a),
	2,
	1
);
registerBuiltin(
	'dup',
	'Duplicates the number on the top of the stack',
	(stack: number[]) => stack.push(stack[stack.length - 1]),
	1,
	2
);
registerBuiltin(
	'swap',
	'Swaps the two numbers on the stack',
	adapt2_2((a, b) => [b, a]),
	2,
	2
);
registerBuiltin(
	'drop',
	'Removes the number on the top of the stack',
	(stack: number[]) => stack.pop(),
	1,
	0
);

function newBuiltin(
	name: string,
	description: string,
	fn: BuiltinFunc,
	numArgs: number,
	numReturns: number
): BuiltinOp {
	return {
		name,
		description,
		fn: wrapTypeChecker(name, fn, numArgs, numReturns),
		numArgs,
		numReturns
	};
}

function wrapTypeChecker(
	name: string,
	fn: BuiltinFunc,
	numArgs: number,
	numReturns: number
): BuiltinFunc {
	return (stack: number[]) => {
		if (stack.length < numArgs) {
			throw new Error(`${name} requires ${numArgs} numbers on the stack`);
		}
		const initialLength = stack.length;
		fn(stack);
		const finalLength = stack.length;

		if (finalLength !== initialLength - numArgs + numReturns) {
			throw new Error(
				`expected ${name} stack length change to be ${numArgs - numReturns}, but got ${finalLength - initialLength}`
			);
		}
	};
}

function adapt2_1(fn: (a: number, b: number) => number): BuiltinFunc {
	return (stack: number[]) => {
		const b = stack.pop();
		const a = stack.pop();
		if (a === undefined || b === undefined) {
			throw new Error(`requires two numbers on the stack - this should be unreachable`);
		}
		stack.push(fn(a, b));
	};
}

function adapt2_2(fn: (a: number, b: number) => [number, number]): BuiltinFunc {
	return (stack: number[]) => {
		const b = stack.pop();
		const a = stack.pop();
		if (a === undefined || b === undefined) {
			throw new Error(`requires two numbers on the stack - this should be unreachable`);
		}
		const [a2, b2] = fn(a, b);
		stack.push(a2, b2);
	};
}

function wrapFn2(fn: (a: number, b: number) => number): BuiltinFunc {
	return (stack: number[]) => {
		const b = stack.pop();
		const a = stack.pop();
		if (a === undefined || b === undefined) {
			throw new Error(`requires two numbers on the stack - this should be unreachable`);
		}
		stack.push(fn(a, b));
	};
}

// In our language, booleans are represented as numbers
function boolToNum(b: boolean): number {
	if (b) {
		return 1;
	}
	return 0;
}

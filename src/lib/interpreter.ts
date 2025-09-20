import { builtins } from './builtins';
import { customOperationsData } from './customOperations';

const debug = false;

// TODO: remove stack input from here
export function interpret(code: string): number[] {
	const [stack, returnEarly] = doInterpret(code, [], 0);
	return stack;
}

export function doInterpret(code: string, stack: number[], callDepth: number): [number[], boolean] {
	debugLog(callDepth, 'interpreting', code, stack);

	const words = lex(code);
	if (words.length === 0) {
		return [stack, false];
	}

	debugLog(callDepth, 'words', words);

	let skippingIf = false;

	for (const word of words) {
		if (skippingIf && word !== 'then') {
			continue;
		}

		if (skippingIf && word === 'then') {
			skippingIf = false;
			continue;
		}

		// Should never happen, but just in case
		if (word.trim() === '') {
			throw new Error('Empty word');
		}

		// Try to parse the word as a number
		const number = Number(word);
		if (!isNaN(number)) {
			debugLog(callDepth, ' pushing number', number);
			stack.push(number);
			continue;
		}

		if (word === 'return') {
			debugLog(callDepth, ' returning');
			return [stack, true];
		}

		// TODO: this is a hacky way to implement ifs. I think it would be better
		// for lex to return actual tokens, with the 'to evaluate' block of the if statement
		// housed within the if token?
		if (word === 'if') {
			debugLog(callDepth, ' executing if');
			const shouldNotExecute = stack.pop() === 0;
			if (shouldNotExecute) {
				skippingIf = true;
			}
			continue;
		}

		// Try to execute the word as a builtin operation
		if (builtins[word]) {
			debugLog(callDepth, ' executing builtin', word);
			builtins[word].fn(stack);
			continue;
		}

		// Try to execute the word as a custom operation
		if (customOperationsData[word]) {
			debugLog(callDepth, ' executing custom operation', word);
			const [updatedStack, returnEarly] = doInterpret(
				customOperationsData[word].body,
				stack,
				callDepth + 1
			);
			if (returnEarly) {
				return [updatedStack, true];
			}
			stack = updatedStack;
			continue;
		}

		throw new Error(`Unknown word: ${word}`);
	}

	return [stack, false];
}

export function lex(code: string): string[] {
	const words = code.trim().split(/\s+/);
	if (words.length === 1 && words[0] === '') {
		return [];
	}
	return words;
}

function debugLog(callDepth: number, ...args: any[]): void {
	if (debug) {
		console.log('  '.repeat(callDepth), ...args);
	}
}

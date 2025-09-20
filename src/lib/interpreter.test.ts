import { describe, it, expect } from 'vitest';
import { interpret, lex } from './interpreter.js';
import { registerCustomOp } from './customOperations.js';

describe('interpret', () => {
	it('should return an empty stack for empty code', () => {
		const result = interpret('');
		expect(result).toEqual([]);
	});

	it('should return an empty stack for whitespace-only code', () => {
		const result = interpret('   \n\t  ');
		expect(result).toEqual([]);
	});

	// Add more test cases as you implement the interpreter functionality
	it('should handle basic operations', () => {
		// Example test - modify based on your interpreter's actual functionality
		const result = interpret('1 2 +');
		expect(result).toEqual([3]);
	});

	it('should handle subtraction', () => {
		const result = interpret('1 2 -');
		expect(result).toEqual([-1]);
	});

	it('modulo', () => {
		const result = interpret('1 2 mod');
		expect(result).toEqual([1]);
	});

	it('custom operation - add 1', () => {
		registerCustomOp('plus1', '1 +');
		const result = interpret('1 plus1');
		expect(result).toEqual([2]);
	});

	it('return stops execution', () => {
		const result = interpret('1 return 0');
		expect(result).toEqual([1]);
	});
});

describe('interpret - if statements', () => {
	it('if skips code if condition is false', () => {
		const result = interpret('0 if 1 return then 2');
		expect(result).toEqual([2]);
	});

	it('if executes code if condition is true', () => {
		const result = interpret('1 if 1 return then 2');
		expect(result).toEqual([1]);
	});
});

describe('interpret - custom operations', () => {
	for (let i = 1; i <= 6; i++) {
		it(`4n - ${i}`, () => {
			const result = interpret(`${i} 4n`);
			if ([1, 5, 9, 13, 17, 21].includes(i)) {
				let expected = i - 1;
				expected = expected / 4;
				expected = expected + 1;

				expect(result).toEqual([expected]);
			} else {
				expect(result).toEqual([0]);
			}
		});
	}
});

describe('lex', () => {
	it('should return an empty array for empty code', () => {
		const result = lex('');
		expect(result).toEqual([]);
	});

	it('should return an array of words for non-empty code', () => {
		const result = lex('1 2 +');
		expect(result).toEqual(['1', '2', '+']);
	});
});

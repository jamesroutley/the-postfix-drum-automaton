import { writable } from 'svelte/store';

interface Op {
	name: string;
	body: string;
}

// Store for UI reactivity
export const customOperations = writable<Record<string, Op>>({});

// Plain object for interpreter access
export const customOperationsData: Record<string, Op> = {};

export function registerCustomOp(name: string, body: string): void {
	const op = { name, body };
	customOperationsData[name] = op;
	customOperations.update((ops) => ({
		...ops,
		[name]: op
	}));
}

export function unregisterCustomOp(name: string): void {
	delete customOperationsData[name];
	customOperations.update((ops) => {
		const newOps = { ...ops };
		delete newOps[name];
		return newOps;
	});
}

registerCustomOp('4n', 'dup 24 mod 1 != if drop 0 return then 1 - 24 / 1 +');
registerCustomOp('8n', 'dup 12 mod 1 != if drop 0 return then 1 - 12 / 1 +');
registerCustomOp('16n', 'dup 6 mod 1 != if drop 0 return then 1 - 6 / 1 +');

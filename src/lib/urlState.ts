export interface DrumMachineState {
	kickSeq: string;
	snareSeq: string;
	closedHihatSeq: string;
	openHihatSeq: string;
	clapSeq: string;
	tomSeq: string;
	cymbalSeq: string;
	wildcardSeq: string;
	bpm: number;
	customOps: Record<string, { name: string; body: string }>;
}

export class URLStateManager {
	private updateTimeout: number | null = null;
	private readonly DEBOUNCE_MS = 500;

	constructor() {
		// Listen for browser back/forward navigation
		if (typeof window !== 'undefined') {
			window.addEventListener('popstate', () => {
				this.loadStateFromURL();
			});
		}
	}

	/**
	 * Serialize state to URL fragment using compact parameter names
	 */
	private serializeState(state: DrumMachineState): string {
		const params = new URLSearchParams();

		// Use single letters for common patterns to minimize URL length
		if (state.kickSeq) params.set('k', state.kickSeq);
		if (state.snareSeq) params.set('s', state.snareSeq);
		if (state.closedHihatSeq) params.set('c', state.closedHihatSeq);
		if (state.openHihatSeq) params.set('o', state.openHihatSeq);
		if (state.clapSeq) params.set('p', state.clapSeq);
		if (state.tomSeq) params.set('t', state.tomSeq);
		if (state.cymbalSeq) params.set('y', state.cymbalSeq);
		if (state.wildcardSeq) params.set('w', state.wildcardSeq);
		if (state.bpm !== 120) params.set('b', state.bpm.toString());

		// Serialize custom operations as JSON
		if (Object.keys(state.customOps).length > 0) {
			params.set('co', JSON.stringify(state.customOps));
		}

		return params.toString();
	}

	/**
	 * Deserialize state from URL fragment
	 */
	private deserializeState(fragment: string): Partial<DrumMachineState> {
		const state: Partial<DrumMachineState> = {};

		if (!fragment) return state;

		try {
			const params = new URLSearchParams(fragment);

			// Map single letters back to full names
			if (params.has('k')) state.kickSeq = params.get('k') || '';
			if (params.has('s')) state.snareSeq = params.get('s') || '';
			if (params.has('c')) state.closedHihatSeq = params.get('c') || '';
			if (params.has('o')) state.openHihatSeq = params.get('o') || '';
			if (params.has('p')) state.clapSeq = params.get('p') || '';
			if (params.has('t')) state.tomSeq = params.get('t') || '';
			if (params.has('y')) state.cymbalSeq = params.get('y') || '';
			if (params.has('w')) state.wildcardSeq = params.get('w') || '';

			const bpm = params.get('b');
			if (bpm) {
				const parsedBpm = parseInt(bpm, 10);
				if (!isNaN(parsedBpm) && parsedBpm >= 30 && parsedBpm <= 200) {
					state.bpm = parsedBpm;
				}
			}

			// Deserialize custom operations
			const customOpsJson = params.get('co');
			if (customOpsJson) {
				try {
					state.customOps = JSON.parse(customOpsJson);
				} catch (parseError) {
					console.warn('Failed to parse custom operations from URL:', parseError);
				}
			}
		} catch (error) {
			console.warn('Failed to parse URL state:', error);
		}

		return state;
	}

	/**
	 * Update URL with current state (debounced)
	 */
	updateURL(state: DrumMachineState): void {
		if (typeof window === 'undefined') return;

		// Clear existing timeout
		if (this.updateTimeout) {
			clearTimeout(this.updateTimeout);
		}

		// Debounce URL updates
		this.updateTimeout = window.setTimeout(() => {
			const fragment = this.serializeState(state);
			const newURL = fragment ? `#${fragment}` : window.location.pathname;

			// Only update if the URL would actually change
			if (window.location.href !== newURL) {
				window.history.replaceState(null, '', newURL);
			}
		}, this.DEBOUNCE_MS);
	}

	/**
	 * Load state from current URL
	 */
	loadStateFromURL(): Partial<DrumMachineState> {
		if (typeof window === 'undefined') return {};

		const fragment = window.location.hash.substring(1); // Remove the #
		return this.deserializeState(fragment);
	}

	/**
	 * Get current URL for sharing
	 */
	getShareableURL(): string {
		if (typeof window === 'undefined') return '';
		return window.location.href;
	}

	/**
	 * Copy current URL to clipboard
	 */
	async copyToClipboard(): Promise<boolean> {
		if (typeof window === 'undefined' || !navigator.clipboard) return false;

		try {
			await navigator.clipboard.writeText(this.getShareableURL());
			return true;
		} catch (error) {
			console.warn('Failed to copy to clipboard:', error);
			return false;
		}
	}
}

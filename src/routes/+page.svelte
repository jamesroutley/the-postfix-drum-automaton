<script lang="ts">
	import { onMount } from 'svelte';
	import { Sequencer } from '$lib/sequencer.js';
	import { URLStateManager, type DrumMachineState } from '$lib/urlState.js';
	import { builtins } from '$lib/builtins.js';
	import {
		customOperations,
		registerCustomOp,
		unregisterCustomOp
	} from '$lib/customOperations.js';

	let sequencer: Sequencer | undefined;
	let isPlaying = false;
	let kickSeq = '4n 1';
	let snareSeq = '4n 2 mod 0 =';
	let closedHihatSeq = '';
	let openHihatSeq = '8n 2 mod 0 = 0.6 *';
	let clapSeq = '16n 16 mod 0 =';
	let tomSeq = '';
	let cymbalSeq = '';
	let wildcardSeq = '';
	let bpm = 120;

	// Custom operations state
	let newOpName = '';
	let newOpBody = '';
	let showAddOpForm = false;

	// URL state management
	let urlStateManager: URLStateManager;

	// Reactive statement to track custom operations changes
	$: customOpsList = Object.values($customOperations);

	onMount(() => {
		// Initialize URL state manager
		urlStateManager = new URLStateManager();

		// Load state from URL on mount
		const urlState = urlStateManager.loadStateFromURL();
		applyState(urlState);

		// Initialize sequencer when component mounts
		sequencer = new Sequencer();
		sequencer.setBpm(bpm);

		updateKickSeq();
		updateSnareSeq();
		updateClosedHihatSeq();
		updateOpenHihatSeq();
		updateClapSeq();
		updateTomSeq();
		updateCymbalSeq();
		updateWildcardSeq();
	});

	function applyState(state: Partial<DrumMachineState>) {
		if (state.kickSeq !== undefined) kickSeq = state.kickSeq;
		if (state.snareSeq !== undefined) snareSeq = state.snareSeq;
		if (state.closedHihatSeq !== undefined) closedHihatSeq = state.closedHihatSeq;
		if (state.openHihatSeq !== undefined) openHihatSeq = state.openHihatSeq;
		if (state.clapSeq !== undefined) clapSeq = state.clapSeq;
		if (state.tomSeq !== undefined) tomSeq = state.tomSeq;
		if (state.cymbalSeq !== undefined) cymbalSeq = state.cymbalSeq;
		if (state.wildcardSeq !== undefined) wildcardSeq = state.wildcardSeq;
		if (state.bpm !== undefined) bpm = state.bpm;
		if (state.customOps !== undefined) {
			// Register all custom operations from URL
			Object.values(state.customOps).forEach((op) => {
				registerCustomOp(op.name, op.body);
			});
		}
	}

	function getCurrentState(): DrumMachineState {
		// Filter out built-in operations (4n, 8n, 16n) for URL storage
		const userCustomOps: Record<string, { name: string; body: string }> = {};
		Object.entries($customOperations).forEach(([name, op]) => {
			if (!['4n', '8n', '16n'].includes(name)) {
				userCustomOps[name] = op;
			}
		});

		return {
			kickSeq,
			snareSeq,
			closedHihatSeq,
			openHihatSeq,
			clapSeq,
			tomSeq,
			cymbalSeq,
			wildcardSeq,
			bpm,
			customOps: userCustomOps
		};
	}

	function updateURL() {
		if (urlStateManager) {
			urlStateManager.updateURL(getCurrentState());
		}
	}

	function startSequencer() {
		if (sequencer) {
			sequencer.start();
			isPlaying = true;
		}
	}

	function stopSequencer() {
		if (sequencer) {
			sequencer.stop();
			isPlaying = false;
		}
	}

	function updateKickSeq() {
		if (sequencer) {
			sequencer.kickSeq = kickSeq;
			// Check for errors immediately
			sequencer.getNoteVelocity(kickSeq, 'kick');
		}
		updateURL();
	}

	function updateSnareSeq() {
		if (sequencer) {
			sequencer.snareSeq = snareSeq;
			// Check for errors immediately
			sequencer.getNoteVelocity(snareSeq, 'snare');
		}
		updateURL();
	}

	function updateClosedHihatSeq() {
		if (sequencer) {
			sequencer.closedHihatSeq = closedHihatSeq;
			// Check for errors immediately
			sequencer.getNoteVelocity(closedHihatSeq, 'closedHihat');
		}
		updateURL();
	}

	function updateOpenHihatSeq() {
		if (sequencer) {
			sequencer.openHihatSeq = openHihatSeq;
			// Check for errors immediately
			sequencer.getNoteVelocity(openHihatSeq, 'openHihat');
		}
		updateURL();
	}

	function updateClapSeq() {
		if (sequencer) {
			sequencer.clapSeq = clapSeq;
			// Check for errors immediately
			sequencer.getNoteVelocity(clapSeq, 'clap');
		}
		updateURL();
	}

	function updateTomSeq() {
		if (sequencer) {
			sequencer.tomSeq = tomSeq;
			// Check for errors immediately
			sequencer.getNoteVelocity(tomSeq, 'tom');
		}
		updateURL();
	}

	function updateCymbalSeq() {
		if (sequencer) {
			sequencer.cymbalSeq = cymbalSeq;
			// Check for errors immediately
			sequencer.getNoteVelocity(cymbalSeq, 'cymbal');
		}
		updateURL();
	}

	function updateWildcardSeq() {
		if (sequencer) {
			sequencer.wildcardSeq = wildcardSeq;
			// Check for errors immediately
			sequencer.getNoteVelocity(wildcardSeq, 'wildcard');
		}
		updateURL();
	}

	function updateBpm() {
		if (sequencer) {
			if (bpm < 30) {
				return;
			}
			sequencer.setBpm(bpm);
		}
		updateURL();
	}

	function addCustomOp() {
		if (!newOpName.trim() || !newOpBody.trim()) {
			return;
		}

		// Register with the interpreter
		registerCustomOp(newOpName, newOpBody);

		// Clear form
		newOpName = '';
		newOpBody = '';
		showAddOpForm = false;

		// Update URL
		updateURL();
	}

	function removeCustomOp(name: string) {
		unregisterCustomOp(name);
		updateURL();
	}
</script>

<div class="main-container">
	<h1>The postfix drum automaton</h1>
	<p>An experimental programmable drum machine</p>

	<div class="controls">
		<button on:click={isPlaying ? stopSequencer : startSequencer}>
			{isPlaying ? 'Stop' : 'Play'}
		</button>

		<label class="bpm-control">
			BPM:
			<input
				type="number"
				bind:value={bpm}
				on:input={updateBpm}
				min="30"
				max="200"
				step="1"
			/>
		</label>
	</div>

	<div class="patterns">
		<div class="pattern-row">
			<div class="pattern-input-row">
				<label for="kick-pattern">Kck</label>
				<input
					id="kick-pattern"
					type="text"
					bind:value={kickSeq}
					on:input={updateKickSeq}
					placeholder="Enter kick pattern"
					aria-describedby="kick-error"
					aria-invalid={sequencer?.errors.kick ? 'true' : 'false'}
				/>
			</div>
			{#if sequencer?.errors.kick}
				<div id="kick-error" role="alert" aria-live="polite" class="error-message">
					{sequencer.errors.kick}
				</div>
			{/if}
		</div>

		<div class="pattern-row">
			<div class="pattern-input-row">
				<label for="snare-pattern">Snr</label>
				<input
					id="snare-pattern"
					type="text"
					bind:value={snareSeq}
					on:input={updateSnareSeq}
					placeholder="Enter snare pattern"
					aria-describedby="snare-error"
					aria-invalid={sequencer?.errors.snare ? 'true' : 'false'}
				/>
			</div>
			{#if sequencer?.errors.snare}
				<div id="snare-error" role="alert" aria-live="polite" class="error-message">
					{sequencer.errors.snare}
				</div>
			{/if}
		</div>

		<div class="pattern-row">
			<div class="pattern-input-row">
				<label for="clap-pattern">Clp</label>
				<input
					id="clap-pattern"
					type="text"
					bind:value={clapSeq}
					on:input={updateClapSeq}
					placeholder="Enter clap pattern"
					aria-describedby="clap-error"
					aria-invalid={sequencer?.errors.clap ? 'true' : 'false'}
				/>
			</div>
			{#if sequencer?.errors.clap}
				<div id="clap-error" role="alert" aria-live="polite" class="error-message">
					{sequencer.errors.clap}
				</div>
			{/if}
		</div>

		<div class="pattern-row">
			<div class="pattern-input-row">
				<label for="closed-hihat-pattern">CHH</label>
				<input
					id="closed-hihat-pattern"
					type="text"
					bind:value={closedHihatSeq}
					on:input={updateClosedHihatSeq}
					placeholder="Enter closed hihat pattern"
					aria-describedby="closed-hihat-error"
					aria-invalid={sequencer?.errors.closedHihat ? 'true' : 'false'}
				/>
			</div>
			{#if sequencer?.errors.closedHihat}
				<div id="closed-hihat-error" role="alert" aria-live="polite" class="error-message">
					{sequencer.errors.closedHihat}
				</div>
			{/if}
		</div>

		<div class="pattern-row">
			<div class="pattern-input-row">
				<label for="open-hihat-pattern">OHH</label>
				<input
					id="open-hihat-pattern"
					type="text"
					bind:value={openHihatSeq}
					on:input={updateOpenHihatSeq}
					placeholder="Enter open hihat pattern"
					aria-describedby="open-hihat-error"
					aria-invalid={sequencer?.errors.openHihat ? 'true' : 'false'}
				/>
			</div>
			{#if sequencer?.errors.openHihat}
				<div id="open-hihat-error" role="alert" aria-live="polite" class="error-message">
					{sequencer.errors.openHihat}
				</div>
			{/if}
		</div>

		<div class="pattern-row">
			<div class="pattern-input-row">
				<label for="tom-pattern">Tom</label>
				<input
					id="tom-pattern"
					type="text"
					bind:value={tomSeq}
					on:input={updateTomSeq}
					placeholder="Enter tom pattern"
					aria-describedby="tom-error"
					aria-invalid={sequencer?.errors.tom ? 'true' : 'false'}
				/>
			</div>
			{#if sequencer?.errors.tom}
				<div id="tom-error" role="alert" aria-live="polite" class="error-message">
					{sequencer.errors.tom}
				</div>
			{/if}
		</div>

		<div class="pattern-row">
			<div class="pattern-input-row">
				<label for="cymbal-pattern">Cym</label>
				<input
					id="cymbal-pattern"
					type="text"
					bind:value={cymbalSeq}
					on:input={updateCymbalSeq}
					placeholder="Enter cymbal pattern"
					aria-describedby="cymbal-error"
					aria-invalid={sequencer?.errors.cymbal ? 'true' : 'false'}
				/>
			</div>
			{#if sequencer?.errors.cymbal}
				<div id="cymbal-error" role="alert" aria-live="polite" class="error-message">
					{sequencer.errors.cymbal}
				</div>
			{/if}
		</div>

		<div class="pattern-row">
			<div class="pattern-input-row">
				<label for="wildcard-pattern">Wld</label>
				<input
					id="wildcard-pattern"
					type="text"
					bind:value={wildcardSeq}
					on:input={updateWildcardSeq}
					placeholder="Enter wildcard pattern"
					aria-describedby="wildcard-error"
					aria-invalid={sequencer?.errors.wildcard ? 'true' : 'false'}
				/>
			</div>
			{#if sequencer?.errors.wildcard}
				<div id="wildcard-error" role="alert" aria-live="polite" class="error-message">
					{sequencer.errors.wildcard}
				</div>
			{/if}
		</div>
	</div>

	<h2>Programming the machine</h2>

	<div>
		<h3>Language syntax</h3>

		<p>
			Each of the eight tracks is programmed using a custom <a
				href="https://en.wikipedia.org/wiki/Stack-oriented_programming">stack-oriented</a
			> programming language. The language operates over a Stack of numbers. A Stack is a data
			type which you can add to the top of ('push'), and remove from the top of ('pop').
		</p>

		<p>To evaluate a program, the interpreter executes each word in the program in order:</p>

		<ul>
			<li>Numbers are pushed to the stack.</li>
			<li>
				Operations are executed and can pop zero or more numbers from the stack. The result
				of the operation is pushed to the stack.
			</li>
			<li><code>return</code> stops the program executing.</li>
			<li>
				<code>if &lt;expression&gt; then</code> only executes
				<code>&lt;expression&gt;</code> if the number on top of the stack is non-zero.
			</li>
		</ul>

		<details>
			<summary>An example [click to expand]</summary>
			<p>
				Given the initial stack <code>[]</code> and the program <code>1 2 +</code>, the
				interpreter would execute the following steps:
			</p>
			<ol>
				<li>Push 1 to the stack: <code>[1]</code></li>
				<li>Push 2 to the stack: <code>[1, 2]</code></li>
				<li>
					Execute the <code>+</code> operation, which pops two numbers from the stack and
					pushes the sum: <code>[3]</code>
				</li>
			</ol>
		</details>

		<details>
			<summary>A more complicated example [click to expand]</summary>
			<p>
				Given the initial stack <code>[]</code> and the program
				<code>1 if 0 return then 2</code>, the interpreter would execute the following
				steps:
			</p>
			<ol>
				<li>Push 1 to the stack: <code>[1]</code></li>
				<li>
					Execute the <code>if</code> operation, which pops the top number from the stack
					and checks if it is non-zero. Since it is, the interpreter runs the code up to
					the <code>then</code> block: <code>0 return</code>. This pushes 0 to the stack
					and exits: <code>[0]</code>
				</li>
				<li>
					Since we've returned early, the code after the <code>then</code> block is not executed,
					so 2 isn't pushed to the stack.
				</li>
			</ol>
		</details>
	</div>

	<div>
		<h3>The drum machine</h3>

		<p>
			Internally, the drum machine has a clock, which increments 24 times per beat. The number
			of beats per minute (BPM) is configurable.
		</p>

		<p>
			On each increment, each track's program is called, with the current clock value passed
			as the only item on the stack.
		</p>

		<p>
			24 times per beat is too fast for most music, so the built in operations <code>4n</code>
			and <code>8n</code>, and <code>16n</code> are provided, which return early unless the current
			clock value is for a quarter note, eighth note, or sixteenth note. Most patterms will start
			with one of these operations.
		</p>
	</div>

	<div>
		<h3>Built-in Operations</h3>

		<p>These operations are built into the interpreter itself.</p>

		<table>
			<thead>
				<tr>
					<th>Op</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.values(builtins) as op}
					<tr>
						<td><code>{op.name}</code></td>
						<td>{op.description}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div>
		<h3>Custom Operations</h3>

		<p>These operations are defined in the language itself, and can be used in patterns. You can define your own.</p>

		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Body</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each customOpsList as op}
					<tr>
						<td>{op.name}</td>
						<td><code>{op.body}</code></td>
						<td class="remove-btn-cell">
							{#if op.name !== '4n' && op.name !== '8n' && op.name !== '16n'}
								<button on:click={() => removeCustomOp(op.name)} class="remove-btn">
									X
								</button>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<div class="custom-ops-container">

		<div class="custom-ops-controls">
			<button on:click={() => (showAddOpForm = !showAddOpForm)}>
				{showAddOpForm ? 'Cancel' : 'Add custom operation'}
			</button>
		</div>

		{#if showAddOpForm}
			<div class="add-op-form">
				<div class="form-row">
					<label for="op-name">Name:</label>
					<input
						id="op-name"
						type="text"
						bind:value={newOpName}
						placeholder="plus1"
					/>
				</div>
				<div class="form-row">
					<label for="op-body">Body:</label>
					<input
						id="op-body"
						type="text"
						bind:value={newOpBody}
						placeholder="1 +"
					/>
				</div>
				<div class="form-row">
					<button
						on:click={addCustomOp}
						disabled={!newOpName.trim() || !newOpBody.trim()}
					>
						Save operation
					</button>
				</div>
			</div>
		{/if}

		</div>

	</div>
</div>

<style>
	:global(body) {
		background-color: #fafaf2;
		color: #1a70b6;
	}

	.main-container {
		max-width: 600px;
		margin: 0 auto;
		margin-bottom: 160px;
	}

	.controls {
		/* text-align: center; */
		margin-bottom: 2rem;
	}


	.custom-ops-controls {
		padding-top: 16px;
	}

	.error-message {
		/* text-align: right; */
		margin-left: 38px;
	}

	.bpm-control {
		display: inline-block;
		margin-left: 1rem;
	}

	.bpm-control input {
		width: 60px;
		margin-left: 0.5rem;
		padding: 8px;
	}

	.patterns {
		/* max-width: 400px; */
		margin: 0 auto;
	}

	.pattern-row {
		display: flex;
		flex-direction: column;
		margin-bottom: 1rem;
	}

	.pattern-input-row {
		display: flex;
		align-items: center;
	}

	.patterns label {
		width: 30px;
		text-align: left;
		flex-shrink: 0;
	}

	.patterns input {
		margin-left: 0.5rem;
		flex: 1;
		padding: 8px;
	}

	code {
		color: #d63031;
		font-size: 1rem;
		font-style: italic;
	}

	table {
		width: 100%;
	}

table, th, td {
  border: 1px solid;
  border-style: dashed;
border-collapse: collapse;
}

	th, td {
		text-align: left;
		vertical-align: top;
		padding: 8px;
	}

	td:first-child {
		min-width: 5ch;
		padding-right: 8px;
	}

	.remove-btn-cell {
		vertical-align: middle;
		align-items: center;
	}

	h1,
	h2 {
		text-decoration: #1a83b6 wavy underline;
	}

	h1,
	h2,
	h3 {
		text-decoration-thickness: 2px;
		font-weight: 500;
		font-style: italic;
	}

	.error-message {
		color: #d63031;
		font-size: 0.9em;
		margin-top: 0.25rem;
		font-style: italic;
	}

	.custom-ops-controls {
		margin-bottom: 1rem;
	}

	.add-op-form {
		background-color: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 4px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.form-row {
		display: flex;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.form-row label {
		width: 80px;
		text-align: right;
		margin-right: 0.5rem;
		flex-shrink: 0;
	}

	.form-row input {
		flex: 1;
		padding: 4px 8px;
		margin-right: 0.5rem;
		font-size: 1rem;
	}

	.controls button {
		padding: 8px;
		background-color: #1a83b6;
		color: white;
		border-radius: 2px;
		border:none;
		font-size: 1rem;
	}

	.controls button:hover {
		background-color: #1a70b6;
	}

	.form-row button {
		padding: 8px;
		background-color: #1a83b6;
		color: white;
		border-radius: 2px;
		border:none;
		font-size: 1rem;
	}

	.form-row button:hover {
		background-color: #1a70b6;
	}

	.custom-ops-controls button {
		padding: 8px;
		background-color: #1a83b6;
		color: white;
		border-radius: 2px;
		border:none;
		font-size: 1rem;
	}

	.custom-ops-controls button:hover {
		background-color: #1a70b6;
	}

	.remove-btn {
		background-color: #dc3545;
		color: white;
		border: none;
		padding: 2px 8px;
		border-radius: 3px;
		font-size: 0.8em;
	}

	.remove-btn:hover {
		background-color: #c82333;
	}
</style>

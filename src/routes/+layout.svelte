<script lang="ts">
	let { children } = $props();
</script>

{@render children?.()}

<style>
	:global(body) {
		font-family: 'IBM Plex Mono', 'Courier New', Courier, monospace;
		font-weight: 400;
		/* font-style: italic; */
	}

	:global(button) {
		font-family: 'IBM Plex Mono', 'Courier New', Courier, monospace;
		font-style: italic;
	}

	:global(input) {
		font-family: 'IBM Plex Mono', 'Courier New', Courier, monospace;
		font-style: italic;
	}
</style>

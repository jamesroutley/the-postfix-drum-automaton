import * as Tone from 'tone';
import { interpret } from './interpreter';

export class Sequencer {
	public kickSeq: string = '';
	public snareSeq: string = '';
	public closedHihatSeq: string = '';
	public openHihatSeq: string = '';
	public clapSeq: string = '';
	public tomSeq: string = '';
	public cymbalSeq: string = '';
	public wildcardSeq: string = '';

	public errors: Record<string, string> = {};

	private kick: Tone.Player;
	private snare: Tone.Player;
	private closedHihat: Tone.Player;
	private openHihat: Tone.Player;
	private clap: Tone.Player;
	private tom: Tone.Player;
	private cymbal: Tone.Player;
	private wildcard: Tone.Player;
	private isPlaying = false;
	private beatCount = 1;

	constructor() {
		// Create players only when the class is instantiated (client-side)
		this.kick = new Tone.Player('/samples/909/BT0A0A7.WAV');
		this.snare = new Tone.Player('/samples/909/ST0T3SA.WAV');
		this.closedHihat = new Tone.Player('/samples/909/HHCD6.WAV');
		this.openHihat = new Tone.Player('/samples/909/HHOD4.WAV');
		this.clap = new Tone.Player('/samples/909/HANDCLP2.WAV');
		this.tom = new Tone.Player('/samples/909/MT3D3.WAV');
		this.cymbal = new Tone.Player('/samples/909/CSHD6.WAV');
		this.wildcard = new Tone.Player('/samples/909/RIDED4.WAV');

		this.kick.toDestination();
		this.snare.toDestination();
		this.closedHihat.toDestination();
		this.openHihat.toDestination();
		this.clap.toDestination();
		this.tom.toDestination();
		this.cymbal.toDestination();
		this.wildcard.toDestination();
	}

	start(): void {
		if (!this.isPlaying) {
			Tone.start();
			this.schedulePatterns();
			Tone.getTransport().PPQ = 192;
			Tone.getTransport().start();
			console.log('PPQ', Tone.getTransport().PPQ);
			this.isPlaying = true;
		}
	}

	private schedulePatterns(): void {
		const transport = Tone.getTransport();

		// Schedule all patterns (every quarter note)
		transport.scheduleRepeat((time) => {
			// Interpret each sequence, using the interpreter.
			// We pull the top value from the stack and use it to determine if
			// we should play the sound.
			const kickValue = this.getNoteVelocity(this.kickSeq, 'kick');
			const snareValue = this.getNoteVelocity(this.snareSeq, 'snare');
			const closedHihatValue = this.getNoteVelocity(this.closedHihatSeq, 'closedHihat');
			const openHihatValue = this.getNoteVelocity(this.openHihatSeq, 'openHihat');
			const clapValue = this.getNoteVelocity(this.clapSeq, 'clap');
			const tomValue = this.getNoteVelocity(this.tomSeq, 'tom');
			const cymbalValue = this.getNoteVelocity(this.cymbalSeq, 'cymbal');
			const wildcardValue = this.getNoteVelocity(this.wildcardSeq, 'wildcard');

			if (kickValue > 0) {
				this.kick.volume.value = this.scaleVolume(kickValue);
				this.kick.start(time);
			}
			if (snareValue > 0) {
				this.snare.volume.value = this.scaleVolume(snareValue);
				this.snare.start(time);
			}
			if (closedHihatValue > 0) {
				this.closedHihat.volume.value = this.scaleVolume(closedHihatValue);
				this.closedHihat.start(time);
			}
			if (openHihatValue > 0) {
				this.openHihat.volume.value = this.scaleVolume(openHihatValue);
				this.openHihat.start(time);
			}
			if (clapValue > 0) {
				this.clap.volume.value = this.scaleVolume(clapValue);
				this.clap.start(time);
			}
			if (tomValue > 0) {
				this.tom.volume.value = this.scaleVolume(tomValue);
				this.tom.start(time);
			}
			if (cymbalValue > 0) {
				this.cymbal.volume.value = this.scaleVolume(cymbalValue);
				this.cymbal.start(time);
			}
			if (wildcardValue > 0) {
				this.wildcard.volume.value = this.scaleVolume(wildcardValue);
				this.wildcard.start(time);
			}

			this.beatCount++;
		}, '8i');
	}

	// Scales 0->1 to -40 -> 0
	scaleVolume(velocity: number): number {
		return -40 + velocity * 40;
	}

	getNoteVelocity(sequence: string, trackName: string): number {
		if (sequence.trim() === '') {
			// Clear error when pattern is empty
			delete this.errors[trackName];
			return 0;
		}

		try {
			const stack = interpret(`${this.beatCount} ${sequence}`);
			if (stack.length === 0) {
				return 0;
			}

			const velocity = stack[stack.length - 1];
			// Clear error on successful parse
			delete this.errors[trackName];
			return Math.min(velocity, 1);
		} catch (error) {
			// Set error message
			const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
			this.errors[trackName] = errorMessage;
			// Return 0 velocity (silent) instead of crashing
			return 0;
		}
	}

	stop(): void {
		Tone.getTransport().stop();
		Tone.getTransport().cancel(); // Clear all scheduled events
		this.isPlaying = false;
	}

	setBpm(bpm: number): void {
		Tone.getTransport().bpm.value = bpm;
	}
}

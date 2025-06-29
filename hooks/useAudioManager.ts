
import { useCallback, useEffect, useRef, useState } from 'react';
import { SoundTriggerState, AudioManagerControls, ProceduralSoundParams, UseAudioManagerProps, GamePhase, AffinityName, EnemyTypeKey } from '../types';
import { WIZARD_STAFF_ID, EMERALD_STAFF_ID, TRIDENT_STAFF_ID, BOOMSTAFF_ID, THUNDER_STAFF_ID, COSMIC_ECHO_STAFF_ID, FLESH_WEAVER_STAFF_ID, REALITY_BENDER_STAFF_ID, GILDED_AEGIS_STAFF_ID, CHAOS_ORB_STAFF_ID, VOID_GAZE_STAFF_ID, NEXUS_KEY_STAFF_ID, THEMATIC_ENEMY_DATA } from '../constants';

const generalSFXVolume = 0.4; 
const generalMusicVolume = 0.15;

// Baseado em C: C, D, E, F#, G#, A#
const WHOLE_TONE_SCALE_FREQUENCIES = [
  // Oitava 3 (Low)
  130.81, 146.83, 164.81, 185.00, 207.65, 233.08,
  // Oitava 4 (Mid - Central)
  261.63, 293.66, 329.63, 369.99, 415.30, 466.16,
  // Oitava 5 (High)
  523.25, 587.33, 659.25, 739.99, 830.61, 932.33
];

export const useAudioManager = ({
  soundTriggers,
  onSoundPlayed,
  gamePhase,
  playerAscensionAffinity
}: UseAudioManagerProps): AudioManagerControls => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isAudioContextInitializedRef = useRef<boolean>(false);
  const ambientIntervalRef = useRef<number | null>(null);

  const initAudioContext = useCallback(async (): Promise<boolean> => {
    if (audioContextRef.current && audioContextRef.current.state === "running") {
      isAudioContextInitializedRef.current = true;
      return true;
    }
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume();
        console.log("AudioContext resumed by initAudioContext call.");
        isAudioContextInitializedRef.current = true;
        return true;
      } catch (error) {
        console.error("Error resuming existing AudioContext in initAudioContext:", error);
        isAudioContextInitializedRef.current = false;
        return false;
      }
    }

    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      if (context.state === 'suspended') {
        // Attempt to resume immediately after creation if suspended
        await context.resume();
      }
      if (context.state === 'running') {
        console.log("AudioContext initialized and running.");
        isAudioContextInitializedRef.current = true;
        return true;
      } else {
        // It might still be suspended if resume() didn't work (e.g., no user gesture yet on some browsers)
        console.warn("AudioContext initialized but may still be suspended. User interaction might be required.");
        isAudioContextInitializedRef.current = true; // Mark as initialized, isReady() will check state
        return true; // Return true as context is created, even if suspended
      }
    } catch (error) {
      console.error("Failed to initialize AudioContext:", error);
      isAudioContextInitializedRef.current = false;
      return false;
    }
  }, []);

  const isReady = useCallback(() => {
    return !!audioContextRef.current && audioContextRef.current.state === 'running' && isAudioContextInitializedRef.current;
  }, []);

  const playProceduralSound = useCallback((params: ProceduralSoundParams, isMusicElement: boolean = false) => {
    if (!isReady() || !audioContextRef.current) return;
    const context = audioContextRef.current;

    const masterGain = context.createGain();
    masterGain.connect(context.destination);

    const baseVolume = isMusicElement ? generalMusicVolume : generalSFXVolume;
    masterGain.gain.value = (params.volume ?? 0.6) * baseVolume;

    const now = context.currentTime;
    const attackTime = params.attackTime ?? 0.005;
    const specifiedDecayTime = params.decayTime ?? (params.type === 'click' ? params.duration * 0.8 : params.duration * 0.6);
    const specifiedReleaseTime = params.releaseTime ?? (params.sustainDuration && params.sustainDuration > 0 ? params.duration * 0.2 : 0);

    // Ensure total duration parts don't exceed params.duration if sustain is not explicitly set
    let sustainDuration = params.sustainDuration ?? 0;
    if (!params.sustainDuration && params.type !== 'click') { // click has its own decay logic essentially
        sustainDuration = Math.max(0, params.duration - attackTime - specifiedDecayTime - specifiedReleaseTime);
    }


    // Apply envelope
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(masterGain.gain.value, now + attackTime);
    
    // Calculate when the sound should naturally end based on ADSR or AD
    let soundEndTime = now + params.duration; // Default end time

    if (sustainDuration > 0) {
        // Hold sustain level until sustainDuration ends
        masterGain.gain.setValueAtTime(masterGain.gain.value, now + attackTime + sustainDuration); 
        // Then release
        masterGain.gain.linearRampToValueAtTime(0, now + attackTime + sustainDuration + specifiedReleaseTime);
        soundEndTime = now + attackTime + sustainDuration + specifiedReleaseTime;
    } else { 
        // No sustain, just decay after attack
        masterGain.gain.linearRampToValueAtTime(0, now + attackTime + specifiedDecayTime);
        soundEndTime = now + attackTime + specifiedDecayTime;
    }
    
    // Ensure oscillator stops slightly after sound envelope finishes to prevent clicks
    const oscillatorStopTime = soundEndTime + 0.01; 

    if (params.type === 'tone' || params.type === 'sweep' || params.type === 'click') {
      const oscillator = context.createOscillator();
      oscillator.type = params.waveType || 'sine';

      if (params.type === 'sweep' && params.sweepStartFreq && params.sweepEndFreq) {
        oscillator.frequency.setValueAtTime(params.sweepStartFreq, now);
        oscillator.frequency.linearRampToValueAtTime(params.sweepEndFreq, now + params.duration);
      } else {
        oscillator.frequency.setValueAtTime(params.frequency as number || 440, now);
      }

      oscillator.connect(masterGain);
      oscillator.start(now);
      oscillator.stop(oscillatorStopTime);
    } else if (params.type === 'noise') {
      // Ensure buffer is long enough for the entire sound including release
      const bufferSize = Math.ceil(context.sampleRate * Math.max(params.duration, oscillatorStopTime - now));
      const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0; // For pink/brownian
      for (let i = 0; i < bufferSize; i++) {
        if (params.noiseType === 'pink') {
          // Paul Kellett's refined method
          const white = Math.random() * 2 - 1;
          const b0 = 0.99886 * lastOut + white * 0.0555179;
          const b1 = 0.99332 * lastOut + white * 0.0750759;
          const b2 = 0.96900 * lastOut + white * 0.1538520;
          const b3 = 0.86650 * lastOut + white * 0.3104856;
          const b4 = 0.55000 * lastOut + white * 0.5329522;
          const b5 = -0.7616 * lastOut - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362;
          output[i] *= 0.11; // (roughly) compensate for gain
          lastOut = output[i];
        } else if (params.noiseType === 'brownian') {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // (roughly) compensate for gain
        }
        else { // white noise
          output[i] = Math.random() * 2 - 1;
        }
      }
      const noiseSource = context.createBufferSource();
      noiseSource.buffer = buffer;

      if (params.filterFrequency) {
        const filter = context.createBiquadFilter();
        filter.type = "lowpass"; // Can be other types like 'highpass', 'bandpass'
        filter.frequency.setValueAtTime(params.filterFrequency, now);
        filter.Q.setValueAtTime(params.filterQ || 1, now);
        noiseSource.connect(filter).connect(masterGain);
      } else {
        noiseSource.connect(masterGain);
      }
      noiseSource.start(now);
      noiseSource.stop(oscillatorStopTime);
    } else if (params.type === 'chord' && params.frequency) {
        const frequencies = Array.isArray(params.frequency) ? params.frequency : [params.frequency];
        frequencies.forEach(freq => {
            const osc = context.createOscillator();
            osc.type = params.waveType || 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.connect(masterGain);
            osc.start(now);
            osc.stop(oscillatorStopTime);
        });
    }
  }, [isReady]);

  const playRandomToneFromScale = useCallback((octaveShift = 0, duration = 0.3, volume = 0.3) => {
    const scale = WHOLE_TONE_SCALE_FREQUENCIES;
    let availableNotes = scale;
    // Determine which part of the scale to use based on octaveShift
    if (octaveShift > 0) { // Higher octave
        availableNotes = scale.slice(Math.floor(scale.length / 3) * 2); // Last third
    } else if (octaveShift < 0) { // Lower octave
        availableNotes = scale.slice(0, Math.ceil(scale.length / 3)); // First third
    } 
    // if octaveShift is 0, it uses the whole scale, or if sliced array is empty
    if (availableNotes.length === 0) availableNotes = scale; 

    const randomIndex = Math.floor(Math.random() * availableNotes.length);
    playProceduralSound({
      type: 'tone',
      frequency: availableNotes[randomIndex],
      duration: duration,
      volume: volume,
      waveType: 'sine',
      attackTime: 0.01,
      decayTime: duration * 0.7,
      releaseTime: duration * 0.3, // Add a slight release for musical tones
      sustainDuration: 0, // No sustain, AD R envelope
    }, true); // isMusicElement = true
  }, [playProceduralSound]);

  const playArpeggioFromScale = useCallback((noteCount: number, intervalMs: number, octaveShift = 0, volume = 0.25) => {
    const scale = WHOLE_TONE_SCALE_FREQUENCIES;
    let availableNotes = scale;
     if (octaveShift > 0) availableNotes = scale.slice(Math.floor(scale.length / 3) * 2);
     else if (octaveShift < 0) availableNotes = scale.slice(0, Math.ceil(scale.length / 3));
     if (availableNotes.length === 0) availableNotes = scale;


    for (let i = 0; i < noteCount; i++) {
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * availableNotes.length);
        playProceduralSound({
          type: 'tone',
          frequency: availableNotes[randomIndex],
          duration: 0.15,
          volume: volume,
          waveType: 'triangle',
          attackTime: 0.005,
          decayTime: 0.1,
          releaseTime: 0.08, // Adding release for arpeggio notes
          sustainDuration: 0,
        }, true); // isMusicElement = true
      }, i * intervalMs);
    }
  }, [playProceduralSound]);

  const playChordFromScale = useCallback((noteCount: number, octaveShift = 0, duration = 0.8, volume = 0.3) => {
    const scale = WHOLE_TONE_SCALE_FREQUENCIES;
    let availableNotes = scale;
    if (octaveShift > 0) availableNotes = scale.slice(Math.floor(scale.length / 3) * 2);
    else if (octaveShift < 0) availableNotes = scale.slice(0, Math.ceil(scale.length / 3));
    if (availableNotes.length === 0) availableNotes = scale;

    const selectedFrequencies: number[] = [];
    const usedIndices = new Set<number>();
    while (selectedFrequencies.length < noteCount && selectedFrequencies.length < availableNotes.length) {
      const randomIndex = Math.floor(Math.random() * availableNotes.length);
      if (!usedIndices.has(randomIndex)) {
        selectedFrequencies.push(availableNotes[randomIndex]);
        usedIndices.add(randomIndex);
      }
    }
    if (selectedFrequencies.length > 0) {
      playProceduralSound({
        type: 'chord',
        frequency: selectedFrequencies,
        duration: duration,
        volume: volume,
        waveType: 'sine',
        attackTime: 0.05,
        decayTime: duration * 0.6, // Adjusted to be part of total duration
        releaseTime: duration * 0.5, // Adjusted for musical chord
        sustainDuration: 0,
      }, true); // isMusicElement = true
    }
  }, [playProceduralSound]);

  // --- UI & Music Element Triggers ---
  useEffect(() => {
    if (soundTriggers.uiClick > 0) {
      playArpeggioFromScale(3, 60, 1, 0.2);
      onSoundPlayed('uiClick');
    }
  }, [soundTriggers.uiClick, playArpeggioFromScale, onSoundPlayed]);

  useEffect(() => {
    if (soundTriggers.uiNavigation > 0) {
      playRandomToneFromScale(0, 0.15, 0.15);
      onSoundPlayed('uiNavigation');
    }
  }, [soundTriggers.uiNavigation, playRandomToneFromScale, onSoundPlayed]);

  useEffect(() => {
    const triggerData = soundTriggers.collectiblePickup;
     if (typeof triggerData === 'number' ? triggerData > 0 : (triggerData as {timestamp: number})?.timestamp > 0) {
      playRandomToneFromScale(1, 0.25, 0.22); // Higher octave for pickup
      onSoundPlayed('collectiblePickup');
    }
  }, [soundTriggers.collectiblePickup, playRandomToneFromScale, onSoundPlayed]);

  useEffect(() => {
    if (soundTriggers.effectActivatePositive > 0) {
      playArpeggioFromScale(4, 70, 0, 0.2); // Slightly more complex arpeggio
      onSoundPlayed('effectActivatePositive');
    }
  }, [soundTriggers.effectActivatePositive, playArpeggioFromScale, onSoundPlayed]);

  useEffect(() => {
    if (soundTriggers.sceneClearedSound > 0) {
      playChordFromScale(3, 0, 1.2, 0.3); // Resolutive chord
      onSoundPlayed('sceneClearedSound');
    }
  }, [soundTriggers.sceneClearedSound, playChordFromScale, onSoundPlayed]);

  useEffect(() => {
    if (soundTriggers.narrativeChoiceMade > 0) {
        playArpeggioFromScale(3, 80, 0, 0.22); // Affirmative arpeggio
        onSoundPlayed('narrativeChoiceMade');
    }
  }, [soundTriggers.narrativeChoiceMade, playArpeggioFromScale, onSoundPlayed]);

  // --- Combat SFX Triggers ---
  useEffect(() => {
    if (soundTriggers.playerJump > 0) {
      playProceduralSound({ type: 'sweep', sweepStartFreq: 250, sweepEndFreq: 600 + Math.random() * 150, duration: 0.12, volume: 0.45, waveType: 'triangle', attackTime: 0.01, decayTime: 0.1, releaseTime: 0.05 });
      onSoundPlayed('playerJump');
    }
  }, [soundTriggers.playerJump, playProceduralSound, onSoundPlayed]);

  useEffect(() => {
    if (soundTriggers.playerLand > 0) {
      playProceduralSound({ type: 'noise', noiseType: 'pink', filterFrequency: 250, filterQ: 1, duration: 0.1, volume: 0.5, attackTime: 0.01, decayTime: 0.08, releaseTime: 0.05 });
      onSoundPlayed('playerLand');
    }
  }, [soundTriggers.playerLand, playProceduralSound, onSoundPlayed]);

  useEffect(() => {
    const triggerData = soundTriggers.playerShoot;
    if (typeof triggerData === 'number' ? triggerData > 0 : triggerData?.timestamp > 0) {
      const staffId = typeof triggerData === 'object' ? triggerData.staffId : WIZARD_STAFF_ID;
      
      if (staffId === WIZARD_STAFF_ID) {
        playProceduralSound({
          type: 'tone',
          waveType: 'triangle', 
          frequency: 90 + Math.random() * 30, // Low, subtle
          duration: 0.025, // Very short
          volume: 0.18,  // Quiet
          attackTime: 0.001, // Very fast attack
          decayTime: 0.024, // Fast decay
          sustainDuration: 0, // No sustain
          releaseTime: 0, // No release
        });
      } else {
        // Generic fallback for other staves if not specifically handled below
        let freq1 = 700 + Math.random() * 200;
        let dur = 0.08;
        let wave: OscillatorType = 'sawtooth';
        let vol = 0.35;
        let attack = 0.002;
        let decay = 0.06;
        let release = 0.04;

        switch(staffId) {
          case EMERALD_STAFF_ID:
              wave = 'sine'; freq1 = 900 + Math.random() * 150; dur=0.06; vol=0.28;
              // Optional secondary "shimmer" for Emerald Staff
              playProceduralSound({ type: 'tone', frequency: freq1 * 1.5, duration: dur*0.5, volume: vol*0.5, waveType: 'sine', attackTime: attack, decayTime: decay*0.4, releaseTime: release*0.3 });
              break;
          case TRIDENT_STAFF_ID:
              wave = 'square'; freq1 = 600 + Math.random() * 80; dur=0.09; vol=0.38;
              // Play main tone, then two slightly detuned and delayed
              for (let i=0; i<2; i++) { // For the other two prongs
                   setTimeout(()=> playProceduralSound({ type: 'tone', frequency: freq1 + (Math.random()-0.5)*50, duration: dur*0.6, volume: vol*0.7, waveType: wave, attackTime: attack, decayTime: decay*0.5, releaseTime: release*0.4 }), (i+1)*25);
              }
              break;
          case BOOMSTAFF_ID:
              // Boomstaff: Low thump + noise burst
              playProceduralSound({ type: 'noise', noiseType: 'brownian', filterFrequency: 150 + Math.random()*50, filterQ: 1, duration: 0.2, volume: 0.6, attackTime: 0.01, decayTime: 0.15, releaseTime: 0.1 });
              playProceduralSound({ type: 'tone', frequency: 70 + Math.random()*20, duration: 0.18, volume: 0.5, waveType: 'sine', attackTime: 0.02, decayTime: 0.12, releaseTime: 0.08 });
              onSoundPlayed('playerShoot'); return; // Exit early as we manually called onSoundPlayed
          case THUNDER_STAFF_ID:
              // Thunder Staff: Sharp crackle + low rumble
              playProceduralSound({ type: 'noise', noiseType: 'white', filterFrequency: 4000 + Math.random()*1000, filterQ: 0.7, duration: 0.12, volume: 0.55, attackTime: 0.001, decayTime: 0.1, releaseTime: 0.05 });
              playProceduralSound({ type: 'sweep', sweepStartFreq: 180, sweepEndFreq: 70, duration: 0.18, volume: 0.4, waveType: 'sawtooth', attackTime: 0.01, decayTime: 0.15, releaseTime: 0.07 });
              onSoundPlayed('playerShoot'); return;
          case COSMIC_ECHO_STAFF_ID:
              // Cosmic Echo: Sine wave with a delayed, softer echo
              wave = 'sine'; freq1 = 500 + Math.random()*100; dur=0.15; vol=0.3;
              playProceduralSound({ type: 'tone', frequency: freq1, duration: dur, volume: vol, waveType: wave, attackTime: 0.02, decayTime: 0.1, releaseTime: 0.08 });
              setTimeout(()=> playProceduralSound({ type: 'tone', frequency: freq1*0.95, duration: dur*0.8, volume: vol*0.5, waveType: 'sine', attackTime: 0.03, decayTime: 0.12, releaseTime: 0.08 }), 80);
              onSoundPlayed('playerShoot'); return;
          case FLESH_WEAVER_STAFF_ID:
              // Flesh Weaver: Organic, squishy noise + low tone
              playProceduralSound({ type: 'noise', noiseType: 'pink', filterFrequency: 250 + Math.random()*100, filterQ: 1.8, duration: 0.15, volume: 0.45, attackTime: 0.01, decayTime: 0.12, releaseTime: 0.07});
              playProceduralSound({ type: 'tone', frequency: 130 + Math.random()*40, duration: 0.12, volume: 0.3, waveType: 'sawtooth', attackTime:0.02, decayTime: 0.1, releaseTime: 0.06 });
              onSoundPlayed('playerShoot'); return;
          case REALITY_BENDER_STAFF_ID:
               // Reality Bender: Modulated sawtooth for a "warping" sound
               wave = 'sawtooth'; freq1 = 280 + Math.random()*80; dur=0.22; vol=0.38; attack = 0.03; decay=0.15; release=0.1;
               if (audioContextRef.current) { // Make sure context exists
                  const modOsc = audioContextRef.current.createOscillator(); modOsc.frequency.value = 4 + Math.random()*4; // LFO
                  const modGain = audioContextRef.current.createGain(); modGain.gain.value = 40 + Math.random()*25; // LFO Depth
                  modOsc.connect(modGain);

                  const mainOsc = audioContextRef.current.createOscillator();
                  mainOsc.type = wave; mainOsc.frequency.value = freq1;
                  modGain.connect(mainOsc.frequency); // LFO modulates main oscillator's frequency

                  const envGain = audioContextRef.current.createGain();
                  envGain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
                  envGain.gain.linearRampToValueAtTime(vol * generalSFXVolume, audioContextRef.current.currentTime + attack);
                  // Simpler decay for modulated sound
                  envGain.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + attack + decay + release);

                  mainOsc.connect(envGain).connect(audioContextRef.current.destination);
                  modOsc.start(); mainOsc.start();
                  // Ensure they stop after the envelope
                  modOsc.stop(audioContextRef.current.currentTime + dur + 0.03);
                  mainOsc.stop(audioContextRef.current.currentTime + dur + 0.03);
               }
               onSoundPlayed('playerShoot'); return;

          case GILDED_AEGIS_STAFF_ID: 
              // Gilded Aegis: Bright sweep + sine tone for activation
              playProceduralSound({ type: 'sweep', sweepStartFreq: 700, sweepEndFreq: 1200, duration: 0.15, volume: 0.35, waveType: 'triangle', attackTime: 0.01, decayTime: 0.1, releaseTime: 0.06 });
              playProceduralSound({ type: 'tone', frequency: 1000 + Math.random()*200, duration: 0.1, volume: 0.25, waveType: 'sine', attackTime: 0.05, decayTime: 0.08, releaseTime: 0.04 });
              onSoundPlayed('playerShoot'); return;
          case CHAOS_ORB_STAFF_ID:
              // Chaos Orb: Random waveform, frequency, duration, volume
              wave = ['sine', 'square', 'sawtooth', 'triangle'][Math.floor(Math.random()*4)] as OscillatorType;
              freq1 = 300 + Math.random()*600;
              dur = 0.05 + Math.random()*0.1;
              vol = 0.3 + Math.random()*0.2;
              break;
          case VOID_GAZE_STAFF_ID: 
              // Void Gaze: Low sawtooth + brownian noise for a "dark energy" feel
              wave = 'sawtooth'; freq1 = 90 + Math.random()*40; dur = 0.28; vol = 0.45; attack = 0.06; decay = 0.18; release = 0.12;
              playProceduralSound({ type: 'noise', noiseType: 'brownian', filterFrequency: 180, duration: dur, volume: vol*0.6, attackTime: attack, decayTime: decay, releaseTime: release });
              break;
          case NEXUS_KEY_STAFF_ID: 
              // Nexus Key: Sweeping sine + filtered pink noise for portal opening
              playProceduralSound({ type: 'sweep', sweepStartFreq: 80, sweepEndFreq: 700, duration: 0.35, volume: 0.45, waveType: 'sine', attackTime: 0.06, decayTime: 0.25, releaseTime: 0.12 });
              playProceduralSound({ type: 'noise', noiseType: 'pink', filterFrequency: 700, filterQ: 0.8, duration: 0.4, volume: 0.35, attackTime: 0.03, decayTime: 0.3, releaseTime: 0.15 });
              onSoundPlayed('playerShoot'); return;

          default: break; // Fallback to generic if staffId not matched
        }
        // Default sound play for staves not handled by special return cases
        playProceduralSound({ type: 'tone', frequency: freq1, duration: dur, volume: vol, waveType: wave, attackTime: attack, decayTime: decay, releaseTime: release });
      }
      onSoundPlayed('playerShoot');
    }
  }, [soundTriggers.playerShoot, playProceduralSound, onSoundPlayed]);


  useEffect(() => {
    const triggerData = soundTriggers.playerHit;
    if (typeof triggerData === 'number' ? triggerData > 0 : triggerData?.timestamp > 0) {
      const damageFactor = typeof triggerData === 'object' ? Math.min(1, triggerData.damageAmount / 30) : 0.5; 
      playProceduralSound({ type: 'noise', noiseType: 'white', filterFrequency: 500 - damageFactor * 150, filterQ: 1.3, duration: 0.18, volume: 0.45 + damageFactor * 0.2, attackTime: 0.001, decayTime: 0.15, releaseTime: 0.1 });
      playProceduralSound({ type: 'tone', frequency: 160 - damageFactor * 40, duration: 0.12, volume: 0.35 + damageFactor * 0.15, waveType: 'square', attackTime: 0.005, decayTime: 0.1, releaseTime: 0.06 });
      onSoundPlayed('playerHit');
    }
  }, [soundTriggers.playerHit, playProceduralSound, onSoundPlayed]);

   useEffect(() => {
    const triggerData = soundTriggers.enemyHit;
     if (typeof triggerData === 'number' ? triggerData > 0 : triggerData?.timestamp > 0) {
      // Softer, "digital" hit sound
      playProceduralSound({ type: 'click', frequency: 450 + Math.random() * 250, duration: 0.06, volume: 0.35, waveType: 'triangle', attackTime: 0.002, decayTime: 0.05, releaseTime: 0.03 });
      playProceduralSound({ type: 'noise', noiseType: 'white', filterFrequency: 1800, filterQ:1.1, duration: 0.05, volume: 0.2, attackTime: 0.001, decayTime: 0.04, releaseTime: 0.02 });
      onSoundPlayed('enemyHit');
    }
  }, [soundTriggers.enemyHit, playProceduralSound, onSoundPlayed]);

  useEffect(() => {
    const triggerData = soundTriggers.enemyDeath;
    if (typeof triggerData === 'number' ? triggerData > 0 : triggerData?.timestamp > 0) {
      const maxHp = typeof triggerData === 'object' ? triggerData.maxHp : 50;
      const enemyType = typeof triggerData === 'object' ? triggerData.enemyType : 'basic_flyer';
      const enemyDetails = THEMATIC_ENEMY_DATA[enemyType];
      const isBoss = enemyDetails?.behaviorProps?.isBoss || (enemyType && enemyType.includes('boss'));

      // More impactful death sound, scales with enemy size/importance
      let baseFreq = isBoss ? 50 : 120 - (maxHp / 800) * 80; baseFreq = Math.max(40, baseFreq); // Lower for bigger enemies
      let dur = isBoss ? 1.0 : 0.3 + (maxHp / 800) * 0.5; dur = Math.min(isBoss ? 1.8 : 1.2, dur);
      let vol = isBoss ? 0.75 : 0.45 + (maxHp / 800) * 0.28; vol = Math.min(isBoss ? 0.85 : 0.75, vol);

      // Noise component for "explosion" or "dissipation"
      playProceduralSound({ type: 'noise', noiseType: 'brownian', filterFrequency: baseFreq * 1.8 + Math.random() * 80, filterQ: 0.7, duration: dur, volume: vol, attackTime: 0.01, decayTime: dur * 0.7, releaseTime: dur*0.5 });
      // Sweeping tone for a "falling apart" or "powering down" effect
      playProceduralSound({ type: 'sweep', sweepStartFreq: baseFreq * 1.8, sweepEndFreq: baseFreq * 0.4, duration: dur*0.8, volume: vol*0.75, waveType: 'sawtooth', attackTime: 0.02, decayTime: dur * 0.6, releaseTime: dur*0.4 });
      if (isBoss) {
          // Additional low-frequency sine wave for boss deaths to add weight
          playProceduralSound({ type: 'tone', frequency: baseFreq * 0.7, duration: dur * 1.3, volume: vol * 0.6, waveType: 'sine', attackTime: 0.12, decayTime: dur * 0.9, releaseTime: dur*0.6 });
      }
      onSoundPlayed('enemyDeath');
    }
  }, [soundTriggers.enemyDeath, playProceduralSound, onSoundPlayed]);

  useEffect(() => {
    if (soundTriggers.barrierShieldBlock > 0) {
        // Sharper, more metallic/glassy block sound
        playProceduralSound({ type: 'tone', frequency: 550 + Math.random()*80, duration: 0.15, volume: 0.5, waveType: 'square', attackTime: 0.002, decayTime: 0.12, releaseTime: 0.06 });
        playProceduralSound({ type: 'noise', noiseType:'white', filterFrequency: 2800, filterQ:1.1, duration: 0.12, volume: 0.35, attackTime: 0.001, decayTime: 0.1, releaseTime: 0.05});
        onSoundPlayed('barrierShieldBlock');
    }
  }, [soundTriggers.barrierShieldBlock, playProceduralSound, onSoundPlayed]);

  useEffect(() => {
    if (soundTriggers.barrierShieldActivate > 0) {
        // "Powering up" sweep for shield activation
        playProceduralSound({ type: 'sweep', sweepStartFreq: 500, sweepEndFreq: 1500, duration: 0.28, volume: 0.35, waveType: 'sine', attackTime: 0.08, decayTime: 0.2, releaseTime: 0.1 });
        onSoundPlayed('barrierShieldActivate');
    }
  }, [soundTriggers.barrierShieldActivate, playProceduralSound, onSoundPlayed]);

  useEffect(() => {
    if (soundTriggers.thunderboltCast > 0) {
        // More intense crackle and rumble for thunderbolt
        playProceduralSound({ type: 'noise', noiseType:'white', filterFrequency: 4500 + Math.random()*1200, filterQ: 0.9, duration: 0.35, volume: 0.65, attackTime: 0.001, decayTime: 0.3, releaseTime: 0.18 });
        playProceduralSound({ type: 'sweep', sweepStartFreq: 220, sweepEndFreq: 60, duration: 0.4, volume: 0.55, waveType: 'sawtooth', attackTime: 0.005, decayTime: 0.32, releaseTime: 0.15 });
        onSoundPlayed('thunderboltCast');
    }
  }, [soundTriggers.thunderboltCast, playProceduralSound, onSoundPlayed]);

  useEffect(() => {
    if (soundTriggers.projectileDestroy > 0) {
        // Muffled, subtle pop for projectile destruction
        playProceduralSound({ 
            type: 'noise', 
            noiseType: 'pink', 
            filterFrequency: 300 + Math.random() * 100, // Lower frequency for muffled sound
            filterQ: 0.7, 
            duration: 0.06, // Short
            volume: 0.25, // Quieter
            attackTime: 0.002, 
            decayTime: 0.05, 
            releaseTime: 0.02 
        });
        onSoundPlayed('projectileDestroy');
    }
  }, [soundTriggers.projectileDestroy, playProceduralSound, onSoundPlayed]);

  useEffect(() => {
    if (soundTriggers.bossRoar > 0) {
        // Deep, rumbling roar for bosses
        playProceduralSound({ type: 'sweep', sweepStartFreq: 100, sweepEndFreq: 50, duration: 1.0, volume: 0.75, waveType: 'sawtooth', attackTime: 0.12, decayTime: 0.7, releaseTime: 0.35 });
        playProceduralSound({ type: 'noise', noiseType: 'brownian', filterFrequency: 250, duration: 1.2, volume: 0.65, attackTime: 0.06, decayTime: 0.9, releaseTime: 0.45 });
        onSoundPlayed('bossRoar');
    }
  }, [soundTriggers.bossRoar, playProceduralSound, onSoundPlayed]);

  // Ambient Music Logic
  useEffect(() => {
    const nonCombatPhases: GamePhase[] = [
      GamePhase.MainMenu, GamePhase.Intro, GamePhase.Paused,
      GamePhase.NarrativeEvent, GamePhase.NarrativeDecision,
      GamePhase.TrophyRoomView, GamePhase.HallOfFameView, GamePhase.CompendiumView,
      GamePhase.SceneCleared, // Play ambient sounds when scene is cleared, before next event
    ];

    const isNonCombat = nonCombatPhases.includes(gamePhase);

    if (isReady() && isNonCombat) {
      if (ambientIntervalRef.current) clearInterval(ambientIntervalRef.current); // Clear previous interval

      const playAmbientElement = () => {
        const isTranscendence = playerAscensionAffinity === 'Transcendência';
        const toneDuration = isTranscendence ? 1.8 + Math.random() * 1.2 : 2.5 + Math.random() * 1.5;
        const toneVolume = 0.03 + Math.random() * 0.03; // Very soft

        if (isTranscendence && Math.random() < 0.4) {
          // Play a soft, two-note chord for Transcendence
          playChordFromScale(2, Math.floor(Math.random()*3)-1, toneDuration * 0.8, toneVolume * 1.2);
        } else {
          // Play a single random tone from the scale
          playRandomToneFromScale(Math.floor(Math.random()*3)-1, toneDuration, toneVolume);
        }
      };

      // Play one immediately with a slight delay, then set interval
      setTimeout(playAmbientElement, Math.random() * 3000 + 1000); // Initial delay

      const intervalTime = playerAscensionAffinity === 'Transcendência'
        ? 3000 + Math.random() * 3000  // More frequent if Transcendence
        : 6000 + Math.random() * 5000; // Less frequent otherwise

      ambientIntervalRef.current = window.setInterval(playAmbientElement, intervalTime);

    } else {
      // If not ready or in combat, clear the interval
      if (ambientIntervalRef.current) {
        clearInterval(ambientIntervalRef.current);
        ambientIntervalRef.current = null;
      }
    }
    
    // Cleanup function for when the component unmounts or dependencies change
    return () => {
      if (ambientIntervalRef.current) clearInterval(ambientIntervalRef.current);
    };
  }, [isReady, gamePhase, playerAscensionAffinity, playRandomToneFromScale, playChordFromScale]);


  return { initAudioContext, isReady };
};

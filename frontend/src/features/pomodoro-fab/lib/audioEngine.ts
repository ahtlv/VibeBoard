// Ambient sound engine using Web Audio API
// Each preset builds a signal chain: noise source → filters → LFO modulation → gain → output

export type SoundPreset = 'rain' | 'ocean' | 'cafe' | 'forest' | 'fireplace' | 'deepfocus'

interface ActiveSound {
  stop: () => void
  setVolume: (v: number) => void
}

// ── helpers ────────────────────────────────────────────────────────────────────

function makeWhiteSource(ctx: AudioContext): AudioBufferSourceNode {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const s = ctx.createBufferSource()
  s.buffer = buf; s.loop = true; return s
}

function makeBrownSource(ctx: AudioContext): AudioBufferSourceNode {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate)
  const d = buf.getChannelData(0); let last = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    d[i] = (last + 0.02 * w) / 1.02
    last = d[i]; d[i] *= 3.8
  }
  const s = ctx.createBufferSource()
  s.buffer = buf; s.loop = true; return s
}

// ── presets ────────────────────────────────────────────────────────────────────

function buildRain(ctx: AudioContext, master: GainNode): () => void {
  // Layer 1: high-pass hiss (falling rain on leaves)
  const hiss = makeWhiteSource(ctx)
  const hpHiss = ctx.createBiquadFilter()
  hpHiss.type = 'highpass'; hpHiss.frequency.value = 1200; hpHiss.Q.value = 0.5
  const gainHiss = ctx.createGain(); gainHiss.gain.value = 0.35
  hiss.connect(hpHiss); hpHiss.connect(gainHiss); gainHiss.connect(master)

  // Layer 2: band-pass mid rumble (rain on surface)
  const mid = makeWhiteSource(ctx)
  const bpMid = ctx.createBiquadFilter()
  bpMid.type = 'bandpass'; bpMid.frequency.value = 600; bpMid.Q.value = 0.7
  const gainMid = ctx.createGain(); gainMid.gain.value = 0.5
  // LFO for "sheets of rain" — slow 0.25 Hz amplitude wave
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.18
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.25; lfo.type = 'sine'
  lfo.connect(lfoGain); lfoGain.connect(gainMid.gain); lfo.start()
  mid.connect(bpMid); bpMid.connect(gainMid); gainMid.connect(master)

  // Layer 3: low rumble (heavy drops / distant thunder undertone)
  const low = makeBrownSource(ctx)
  const lpLow = ctx.createBiquadFilter()
  lpLow.type = 'lowpass'; lpLow.frequency.value = 180; lpLow.Q.value = 0.3
  const gainLow = ctx.createGain(); gainLow.gain.value = 0.25
  low.connect(lpLow); lpLow.connect(gainLow); gainLow.connect(master)

  hiss.start(); mid.start(); low.start()
  return () => { try { hiss.stop(); mid.stop(); low.stop(); lfo.stop() } catch {} }
}

function buildOcean(ctx: AudioContext, master: GainNode): () => void {
  // Pink-ish noise, low-pass filtered, slow amplitude envelope = waves
  const src = makeWhiteSource(ctx)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'; lp.frequency.value = 800; lp.Q.value = 0.4

  // Wave LFO — 0.08 Hz (one wave every ~12 sec)
  const ampGain = ctx.createGain(); ampGain.gain.value = 0.6
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.45
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.08; lfo.type = 'sine'
  lfo.connect(lfoGain); lfoGain.connect(ampGain.gain); lfo.start()

  // Sub rumble for depth
  const rumble = makeBrownSource(ctx)
  const lpRumble = ctx.createBiquadFilter()
  lpRumble.type = 'lowpass'; lpRumble.frequency.value = 90; lpRumble.Q.value = 0.2
  const gRumble = ctx.createGain(); gRumble.gain.value = 0.18

  src.connect(lp); lp.connect(ampGain); ampGain.connect(master)
  rumble.connect(lpRumble); lpRumble.connect(gRumble); gRumble.connect(master)
  src.start(); rumble.start()
  return () => { try { src.stop(); rumble.stop(); lfo.stop() } catch {} }
}

function buildCafe(ctx: AudioContext, master: GainNode): () => void {
  // Mid-band pink noise = crowd chatter base
  const src = makeWhiteSource(ctx)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.6
  const g = ctx.createGain(); g.gain.value = 0.4

  // Second layer: low cut for warmth
  const src2 = makeWhiteSource(ctx)
  const hp2 = ctx.createBiquadFilter()
  hp2.type = 'bandpass'; hp2.frequency.value = 350; hp2.Q.value = 1.2
  const g2 = ctx.createGain(); g2.gain.value = 0.22

  // Subtle presence shimmer — fast LFO (1.7 Hz) on high layer
  const shimmerLfo = ctx.createOscillator()
  shimmerLfo.frequency.value = 1.7; shimmerLfo.type = 'sine'
  const shimmerGain = ctx.createGain(); shimmerGain.gain.value = 0.06
  shimmerLfo.connect(shimmerGain); shimmerGain.connect(g.gain); shimmerLfo.start()

  src.connect(bp); bp.connect(g); g.connect(master)
  src2.connect(hp2); hp2.connect(g2); g2.connect(master)
  src.start(); src2.start()
  return () => { try { src.stop(); src2.stop(); shimmerLfo.stop() } catch {} }
}

function buildForest(ctx: AudioContext, master: GainNode): () => void {
  // Light wind: pink-ish low-pass, gentle slow LFO
  const wind = makeWhiteSource(ctx)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'; lp.frequency.value = 1400; lp.Q.value = 0.3
  const gWind = ctx.createGain(); gWind.gain.value = 0.18
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.10
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12; lfo.type = 'sine'
  lfo.connect(lfoGain); lfoGain.connect(gWind.gain); lfo.start()
  wind.connect(lp); lp.connect(gWind); gWind.connect(master)

  // Bird chirps via oscillators at random intervals
  const chirpIntervals: ReturnType<typeof setInterval>[] = []
  function chirp() {
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    const baseFreq = 2400 + Math.random() * 1600
    osc.type = 'sine'; osc.frequency.value = baseFreq
    env.gain.setValueAtTime(0, ctx.currentTime)
    env.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02)
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18 + Math.random() * 0.12)
    osc.connect(env); env.connect(master)
    osc.start(); osc.stop(ctx.currentTime + 0.35)
  }
  const iv1 = setInterval(() => { if (Math.random() > 0.45) chirp() }, 900)
  const iv2 = setInterval(() => { if (Math.random() > 0.6) chirp() }, 1700)
  chirpIntervals.push(iv1, iv2)

  wind.start()
  return () => {
    try { wind.stop(); lfo.stop() } catch {}
    chirpIntervals.forEach(clearInterval)
  }
}

function buildFireplace(ctx: AudioContext, master: GainNode): () => void {
  // Warm brown noise base (fire rumble)
  const src = makeBrownSource(ctx)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 0.5
  const g = ctx.createGain(); g.gain.value = 0.38

  // Mid-high crackle layer
  const crackle = makeWhiteSource(ctx)
  const hpC = ctx.createBiquadFilter()
  hpC.type = 'highpass'; hpC.frequency.value = 2800; hpC.Q.value = 1.2
  const gC = ctx.createGain(); gC.gain.value = 0.08

  // Random crackle bursts
  const intervals: ReturnType<typeof setInterval>[] = []
  function burst() {
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, ctx.currentTime)
    env.gain.linearRampToValueAtTime(0.15 + Math.random() * 0.2, ctx.currentTime + 0.01)
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05 + Math.random() * 0.08)
    gC.connect(env); env.connect(master)
    setTimeout(() => { try { gC.disconnect(env) } catch {} }, 200)
  }
  const iv = setInterval(() => { if (Math.random() > 0.5) burst() }, 280)
  intervals.push(iv)

  // Slow breathing LFO for "living fire"
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.08
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.4; lfo.type = 'sine'
  lfo.connect(lfoGain); lfoGain.connect(g.gain); lfo.start()

  src.connect(lp); lp.connect(g); g.connect(master)
  crackle.connect(hpC); hpC.connect(gC)
  src.start(); crackle.start()
  return () => { try { src.stop(); crackle.stop(); lfo.stop() } catch {}; intervals.forEach(clearInterval) }
}

function buildDeepFocus(ctx: AudioContext, master: GainNode): () => void {
  // 432Hz drone + harmonic series (binaural-ish focus tone)
  const freqs = [108, 216, 432, 648]
  const oscs: OscillatorNode[] = []
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'; osc.frequency.value = f
    g.gain.value = 0.07 / (i + 1)
    osc.connect(g); g.connect(master); osc.start()
    oscs.push(osc)
  })
  // Subtle beat at 10Hz (alpha wave entrainment simulation) via slight detuning
  const beat = ctx.createOscillator()
  const gBeat = ctx.createGain()
  beat.type = 'sine'; beat.frequency.value = 442 // 10Hz offset from 432
  gBeat.gain.value = 0.025
  beat.connect(gBeat); gBeat.connect(master); beat.start()

  // Brown noise bed at very low volume for warmth
  const bed = makeBrownSource(ctx)
  const lpBed = ctx.createBiquadFilter()
  lpBed.type = 'lowpass'; lpBed.frequency.value = 250
  const gBed = ctx.createGain(); gBed.gain.value = 0.06
  bed.connect(lpBed); lpBed.connect(gBed); gBed.connect(master); bed.start()

  return () => {
    try { oscs.forEach(o => o.stop()); beat.stop(); bed.stop() } catch {}
  }
}

// ── public API ─────────────────────────────────────────────────────────────────

const builders: Record<SoundPreset, (ctx: AudioContext, master: GainNode) => () => void> = {
  rain: buildRain,
  ocean: buildOcean,
  cafe: buildCafe,
  forest: buildForest,
  fireplace: buildFireplace,
  deepfocus: buildDeepFocus,
}

export function startSound(preset: SoundPreset, volume: number): ActiveSound {
  const ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  const master = ctx.createGain()
  master.gain.value = volume
  master.connect(ctx.destination)
  const stop = builders[preset](ctx, master)
  return {
    stop: () => { stop(); setTimeout(() => ctx.close(), 200) },
    setVolume: (v) => { master.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.1) },
  }
}

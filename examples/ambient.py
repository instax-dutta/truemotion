#!/usr/bin/env python3
"""Generate the ambient score used by pro-demo.mjs: chord pad, sub, plucks, air, delay."""
import math
import sys
import wave

import numpy as np

SR = 44100
DURATION = float(sys.argv[2]) if len(sys.argv) > 2 else 25.0
T = np.arange(int(SR * DURATION), dtype=np.float64) / SR

# Am - F - C - G - Am, one chord every five seconds.
CHORDS = [
    ([57, 60, 64], 45),
    ([53, 57, 60], 41),
    ([48, 52, 55], 36),
    ([55, 59, 62], 43),
    ([57, 60, 64], 45),
]
SEG = DURATION / len(CHORDS)


def hz(midi):
    return 440.0 * 2.0 ** ((midi - 69) / 12.0)


def lowpass(x, cutoff):
    a = math.exp(-2.0 * math.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, value in enumerate(x):
        acc = (1.0 - a) * value + a * acc
        y[i] = acc
    return y


def envelope(start, length, fade=0.85):
    up = np.clip((T - (start - fade)) / fade, 0.0, 1.0)
    down = np.clip(((start + length + fade) - T) / fade, 0.0, 1.0)
    return up * down


left = np.zeros_like(T)
right = np.zeros_like(T)

for i, (notes, bass) in enumerate(CHORDS):
    start = i * SEG
    env = envelope(start, SEG)
    for j, note in enumerate(notes):
        f = hz(note)
        voice = (
            np.sin(2 * np.pi * f * T)
            + 0.34 * np.sin(2 * np.pi * f * 1.003 * T + j)
            + 0.16 * np.sin(2 * np.pi * f * 2 * T)
        ) * (0.30 if j == 0 else 0.22)
        # Slight stereo spread from detune phase.
        left += voice * env * 0.95
        right += voice * env * 1.05

    bf = hz(bass)
    sub = np.sin(2 * np.pi * bf * T) * (1 + 0.12 * np.sin(2 * np.pi * 0.18 * T))
    left += sub * env * 0.42
    right += sub * env * 0.42

    # Soft plucked arpeggio, one note every 5/8 second, alternating ears.
    step = 0.625
    k = 0
    pluck_t = start + 0.35
    while pluck_t < start + SEG - 0.3:
        note = notes[[0, 1, 2, 1][k % 4]] + 12
        pf = hz(note)
        offset = int(pluck_t * SR)
        length = int(0.95 * SR)
        if offset + length <= len(T):
            local = np.arange(length) / SR
            shape = (1 - np.exp(-local / 0.004)) * np.exp(-local / 0.28)
            pluck = (np.sin(2 * np.pi * pf * local) + 0.28 * np.sin(2 * np.pi * 2 * pf * local)) * shape * 0.16
            pan = 0.35 if k % 2 == 0 else 0.65
            left[offset:offset + length] += pluck * (1 - pan) * 1.6
            right[offset:offset + length] += pluck * pan * 1.6
        k += 1
        pluck_t += step

# Airy filtered noise bed, breathing slowly.
rng = np.random.default_rng(7)
noise = rng.standard_normal(len(T))
air = lowpass(noise, 420) - lowpass(noise, 90)
breath = 0.5 + 0.5 * np.sin(2 * np.pi * 0.075 * T)
left += air * breath * 0.18
right += air * breath * 0.18

# Short feedback delays for space.
def add_delay(signal, delay_s, feedback, mix):
    d = int(delay_s * SR)
    out = signal.copy()
    for k in range(1, 6):
        out[d * k:] += signal[:-d * k] * (feedback ** k) * mix
    return out

left = add_delay(left, 0.117, 0.46, 0.30)
right = add_delay(right, 0.163, 0.44, 0.30)

fade_in = np.clip(T / 2.0, 0, 1)
fade_out = np.clip((DURATION - T) / 2.5, 0, 1)
master = fade_in * fade_out
left *= master
right *= master

peak = max(np.max(np.abs(left)), np.max(np.abs(right)))
if peak > 0:
    gain = min(0.85 / peak, 0.063 / max(np.sqrt(np.mean(left ** 2 + right ** 2) / 2), 1e-9))
    left *= gain
    right *= gain

stereo = np.empty((len(T), 2), dtype=np.float64)
stereo[:, 0] = np.tanh(left)
stereo[:, 1] = np.tanh(right)
pcm = (stereo * 32767).astype('<i2')

out = sys.argv[1] if len(sys.argv) > 1 else 'ambient.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f'wrote {out}: {len(T) / SR:.2f}s, rms={np.sqrt(np.mean(stereo ** 2)):.4f}')

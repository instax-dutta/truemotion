import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function buildSegmentArgs({ fps, crf = 18, outPath }) {
  return ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', 'pipe:0',
    '-c:v', 'libx264', '-crf', String(crf), '-pix_fmt', 'yuv420p',
    '-f', 'mpegts', path.resolve(outPath)];
}

export function buildFinalizeArgs({ listFile, audio, outPath, totalSeconds }) {
  const args = ['-y', '-f', 'concat', '-safe', '0', '-i', listFile];
  if (audio && fs.existsSync(audio)) {
    const fadeOut = Math.max(0, totalSeconds - 0.6);
    args.push('-stream_loop', '-1', '-i', audio);
    args.push('-c:v', 'copy', '-c:a', 'aac');
    args.push('-af', `afade=t=in:st=0:d=0.6,afade=t=out:st=${fadeOut}:d=0.6`, '-shortest');
  } else {
    args.push('-c:v', 'copy', '-an');
  }
  args.push('-movflags', '+faststart', path.resolve(outPath));
  return args;
}

export function buildEncoderArgs({ fps, audio, crf = 18, outPath, totalSeconds = 0 }) {
  const args = ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', 'pipe:0'];
  if (audio && fs.existsSync(audio)) {
    const fadeOut = Math.max(0, totalSeconds - 0.6);
    args.push('-stream_loop', '-1', '-i', audio);
    args.push('-c:v', 'libx264', '-crf', String(crf), '-pix_fmt', 'yuv420p');
    args.push('-c:a', 'aac', '-af', `afade=t=in:st=0:d=0.6,afade=t=out:st=${fadeOut}:d=0.6`, '-shortest');
  } else {
    args.push('-c:v', 'libx264', '-crf', String(crf), '-pix_fmt', 'yuv420p');
  }
  args.push('-movflags', '+faststart', path.resolve(outPath));
  return args;
}

export function createEncoder({ fps, audio, crf, outPath, totalSeconds }) {
  const args = buildEncoderArgs({ fps, audio, crf, outPath, totalSeconds });
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  const child = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'pipe'] });
  let stderr = '';
  let spawnError = null;
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('error', (error) => { spawnError = error; });
  const exited = new Promise((resolve) => child.on('close', (code) => resolve(code)));

  return {
    args,
    async write(buffer) {
      if (spawnError) throw spawnError;
      if (child.stdin.write(buffer)) return;
      await new Promise((resolve, reject) => {
        const cleanup = () => {
          child.stdin.off('drain', onDrain);
          child.stdin.off('error', onError);
        };
        const onDrain = () => { cleanup(); resolve(); };
        const onError = (error) => { cleanup(); reject(error); };
        child.stdin.once('drain', onDrain);
        child.stdin.once('error', onError);
      });
    },
    async finish() {
      child.stdin.end();
      const code = await exited;
      if (spawnError) throw spawnError;
      if (code !== 0) throw new Error(`ffmpeg failed: ${stderr.slice(-1000)}`);
      return { code };
    }
  };
}

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export function playSound(type: 'success' | 'error' | 'jump' | 'click' | 'portal' | 'dialog') {
  try {
    const enabled = localStorage.getItem('soundEnabled');
    if (enabled === 'false') return;
  } catch {
    // ignore
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  if (type === 'success') {
    // A nice little chime
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.4);
  } else if (type === 'error') {
    // A low buzz
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
  } else if (type === 'jump') {
    // A quick upward sweep
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(180, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(420, audioCtx.currentTime + 0.12);
    
    gainNode.gain.setValueAtTime(0.70, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.12);
  } else if (type === 'click') {
    // Tiny mechanical blip
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(650, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.04);
  } else if (type === 'dialog') {
    // Pleasant double blip
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    oscillator.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.06); // A5
    
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.15);
  } else if (type === 'portal') {
    // Beautiful ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const noteOsc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();
      noteOsc.connect(noteGain);
      noteGain.connect(audioCtx.destination);
      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.08);
      
      noteGain.gain.setValueAtTime(0.15, audioCtx.currentTime + index * 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + index * 0.08 + 0.25);
      
      noteOsc.start(audioCtx.currentTime + index * 0.08);
      noteOsc.stop(audioCtx.currentTime + index * 0.08 + 0.25);
    });
  }
}

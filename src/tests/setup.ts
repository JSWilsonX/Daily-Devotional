import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock URL.createObjectURL and revokeObjectURL
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-blob-url');
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = vi.fn();
  }

  // Mock document.fonts
  if (!document.fonts) {
    (document as any).fonts = {
      ready: Promise.resolve(),
      check: vi.fn().mockReturnValue(true),
      load: vi.fn().mockResolvedValue([]),
    };
  }
}

// Mock Web Speech API SpeechSynthesis
class MockSpeechSynthesisUtterance {
  text: string;
  lang: string = 'en-US';
  pitch: number = 1.0;
  rate: number = 1.0;
  voice: any = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  onpause: (() => void) | null = null;
  onresume: (() => void) | null = null;

  constructor(text: string = '') {
    this.text = text;
  }
}

const mockVoices = [
  { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US', default: true },
  { name: 'Microsoft Zira Desktop - English (United States)', lang: 'en-US', default: false },
  { name: 'Google US English (Female)', lang: 'en-US', default: false },
  { name: 'Google UK English Male', lang: 'en-GB', default: false },
];

const mockSpeechSynthesis = {
  speaking: false,
  paused: false,
  pending: false,
  onvoiceschanged: null,
  getVoices: vi.fn().mockReturnValue(mockVoices),
  speak: vi.fn().mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
    mockSpeechSynthesis.speaking = true;
    if (utterance.onstart) utterance.onstart();
    setTimeout(() => {
      mockSpeechSynthesis.speaking = false;
      if (utterance.onend) utterance.onend();
    }, 10);
  }),
  cancel: vi.fn().mockImplementation(() => {
    mockSpeechSynthesis.speaking = false;
    mockSpeechSynthesis.paused = false;
  }),
  pause: vi.fn().mockImplementation(() => {
    mockSpeechSynthesis.paused = true;
  }),
  resume: vi.fn().mockImplementation(() => {
    mockSpeechSynthesis.paused = false;
  }),
};

// Assign SpeechSynthesis mocks to window & global
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    writable: true,
    value: MockSpeechSynthesisUtterance,
  });

  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: mockSpeechSynthesis,
  });

  // Mock navigator.share and canShare
  Object.defineProperty(navigator, 'canShare', {
    writable: true,
    value: vi.fn().mockReturnValue(true),
  });

  Object.defineProperty(navigator, 'share', {
    writable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });

  // Mock clipboard
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });

  // Mock HTMLCanvasElement.getContext
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    roundRect: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 100 }),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
  }) as any;

  HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((callback: any) => {
    callback(new Blob(['mock-image'], { type: 'image/jpeg' }));
  });

  HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,mock');
}

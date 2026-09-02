import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePWAStatus } from '../../hooks/usePWAStatus';

describe('usePWAStatus Hook & Installation Agent (FR-7 & Workflow 7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reflect initial online state from window.navigator.onLine', () => {
    const { result } = renderHook(() => usePWAStatus());
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  it('should react to online/offline window events', () => {
    const { result } = renderHook(() => usePWAStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
  });

  it('should capture beforeinstallprompt and trigger install prompt', async () => {
    const { result } = renderHook(() => usePWAStatus());

    const mockPromptEvent = new Event('beforeinstallprompt') as any;
    mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
    mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

    act(() => {
      window.dispatchEvent(mockPromptEvent);
    });

    expect(result.current.isInstallable).toBe(true);

    await act(async () => {
      await result.current.handleInstallPWA();
    });

    expect(mockPromptEvent.prompt).toHaveBeenCalled();
    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isAppInstalled).toBe(true);
  });
});

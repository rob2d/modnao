import { act, renderHook, waitFor } from '@testing-library/react';
import useViewOptionSetting from './useViewOptionSetting';

describe('useViewOptionSetting', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return the default value if no storageKey is provided', () => {
    const { result } = renderHook(() => useViewOptionSetting('default'));

    expect(result.current[0]).toBe('default');
  });

  it('should return the stored value if storageKey is provided', () => {
    localStorage.setItem('testKey', 'storedValue');
    const { result } = renderHook(() =>
      useViewOptionSetting('default', 'testKey')
    );

    expect(result.current[0]).toBe('storedValue');
  });

  it('should update the value and store it in localStorage', async () => {
    const { result } = renderHook(() =>
      useViewOptionSetting('default', 'testKey')
    );

    act(() => {
      result.current[1]('newValue');
    });

    await waitFor(() => {
      expect(result.current[0]).toBe('newValue');
      expect(localStorage.getItem('testKey')).toBe('newValue');
    });
  });

  it('should handle number values correctly', async () => {
    localStorage.setItem('numberKey', '42');
    const { result } = renderHook(() => useViewOptionSetting(0, 'numberKey'));

    expect(result.current[0]).toBe(42);

    act(() => {
      result.current[1](100);
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(100);
      expect(localStorage.getItem('numberKey')).toBe('100');
    });
  });

  it('should handle boolean values correctly', async () => {
    localStorage.setItem('booleanKey', 'true');
    const { result } = renderHook(() =>
      useViewOptionSetting(false, 'booleanKey')
    );

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](false);
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(false);
      expect(localStorage.getItem('booleanKey')).toBe('false');
    });
  });

  it('should handle object values correctly', async () => {
    const storedObject = { key: 'value' };
    localStorage.setItem('objectKey', JSON.stringify(storedObject));
    const { result } = renderHook(() => useViewOptionSetting({}, 'objectKey'));

    expect(result.current[0]).toEqual(storedObject);

    const newObject = { key: 'newValue' };
    act(() => {
      result.current[1](newObject);
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual(newObject);
      expect(localStorage.getItem('objectKey')).toBe(JSON.stringify(newObject));
    });
  });
});

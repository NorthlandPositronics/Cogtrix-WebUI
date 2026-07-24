import "@testing-library/jest-dom/vitest";

// Node >= 22 defines a built-in global `localStorage` accessor that resolves to
// undefined unless the process is started with --localstorage-file, and it takes
// precedence over jsdom's implementation (under vitest's jsdom environment
// `window === globalThis`, so both read as undefined). Install a minimal
// in-memory Storage so persistence tests and zustand's persist middleware work.
// No-op on runtimes that already provide a real localStorage.
if (!globalThis.localStorage) {
  const store = new Map<string, string>();
  const storage = {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  } as unknown as Storage;

  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
}

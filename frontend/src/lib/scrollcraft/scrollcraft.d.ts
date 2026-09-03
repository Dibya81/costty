export interface ScrollCraftInstance {
  layout: () => void;
  read: () => void;
  acts: unknown[];
  worlds: unknown[];
  clips: unknown[];
  lerp: number;
}

export interface ScrollCraftAPI {
  mount: (root?: Element | Document | string, opts?: { lerp?: number }) => ScrollCraftInstance;
  reduce: boolean;
  instances: ScrollCraftInstance[];
}

declare global {
  interface Window {
    ScrollCraft: ScrollCraftAPI;
  }
}

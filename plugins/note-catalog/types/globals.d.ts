declare module "*.scss" {
  const content: string;
  export default content;
}

declare module "*.inline.ts" {
  const content: string;
  export default content;
}

interface CustomEventMap {
  nav: CustomEvent<{ url: string }>;
}

interface Document {
  addEventListener<K extends keyof CustomEventMap>(
    type: K,
    listener: (this: Document, ev: CustomEventMap[K]) => void,
  ): void;
}

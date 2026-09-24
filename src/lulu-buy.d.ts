// Type declarations for Lulu's <lulu-buy-button> custom element.
// The element itself is registered by https://js.lulu.com/lulu-buy.js,
// loaded once from index.html.
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type LuluBuyButtonVariant = 'product-showcase' | 'simplified' | 'button-only';

interface LuluBuyButtonAttributes extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  'buy-button-id': string;
  variant?: LuluBuyButtonVariant;
}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'lulu-buy-button': LuluBuyButtonAttributes;
    }
  }
}

import { QuartzComponent } from '@quartz-community/types';

/**
 * v4 parity: v4's `quartz/components/Footer.tsx` replaced the stock
 * "Created with Quartz vX © year" text with a custom attribution line and
 * dropped the version/year entirely, adding an `<hr />` divider above it.
 * The v5 `footer` community plugin has no option to customize that text, so
 * this local plugin replaces it wholesale (registered under the same
 * structural "footer" slot — see quartz.config.yaml).
 */
interface FooterOptions {
    links: Record<string, string>;
}
declare const _default: (opts?: FooterOptions) => QuartzComponent;

export { type FooterOptions as F, _default as Footer };

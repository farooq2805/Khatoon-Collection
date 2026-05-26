declare module "*.css";
declare module "*.scss";
declare module "*.sass";

// Behold.so Instagram Widget custom HTML element declaration
declare namespace JSX {
  interface IntrinsicElements {
    "behold-widget": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { "feed-id"?: string }, HTMLElement>;
  }
}

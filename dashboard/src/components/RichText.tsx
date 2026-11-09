import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Heading3, Eraser } from "lucide-react";

/**
 * Small formatting editor for product descriptions (stored as HTML, like the
 * classic editor). Bold, italic, heading and lists cover what the store uses.
 */
export default function RichText({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Only push outside changes into the editor (e.g. after loading a product)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || "";
  }, [value]);

  const run = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML || "");
  };

  const tools = [
    { icon: <Heading3 className="h-4 w-4" />, title: "Heading", act: () => run("formatBlock", "h3") },
    { icon: <Bold className="h-4 w-4" />, title: "Bold", act: () => run("bold") },
    { icon: <Italic className="h-4 w-4" />, title: "Italic", act: () => run("italic") },
    { icon: <List className="h-4 w-4" />, title: "Bullet list", act: () => run("insertUnorderedList") },
    { icon: <ListOrdered className="h-4 w-4" />, title: "Numbered list", act: () => run("insertOrderedList") },
    { icon: <Eraser className="h-4 w-4" />, title: "Clear formatting", act: () => run("removeFormat") },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
      <div className="flex gap-0.5 border-b border-line bg-neutral-50/70 px-1.5 py-1">
        {tools.map((t) => (
          <button key={t.title} type="button" title={t.title} onMouseDown={(e) => e.preventDefault()} onClick={t.act} className="rounded-md p-1.5 text-neutral-600 hover:bg-white hover:text-neutral-900">
            {t.icon}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => onChange(ref.current?.innerHTML || "")}
        onPaste={(e) => {
          // Paste as plain text so WhatsApp/Word styling doesn't leak in
          e.preventDefault();
          document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
        }}
        className="rich-text min-h-[160px] px-3 py-2.5 text-sm leading-relaxed outline-none"
      />
    </div>
  );
}

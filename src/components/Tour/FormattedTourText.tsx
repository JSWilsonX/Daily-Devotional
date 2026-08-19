import React from "react";

/**
 * Parses markdown-like formatting:
 * - Bold: **text**
 * - Italic: *text* or _text_
 * - Inline code: `text`
 * - Paragraphs with spacing
 */
export const FormattedTourText: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => {
  if (!text) return null;

  // Split into paragraphs if multiple newlines exist
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className={`space-y-2 text-xs text-slate-300 leading-relaxed font-sans ${className}`}>
      {paragraphs.map((para, pIdx) => {
        // Parse bold, italic, code inline tokens
        // Regex matches **bold**, *italic*, _italic_, `code`
        const parts: React.ReactNode[] = [];
        const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(para)) !== null) {
          // Push text before match
          if (match.index > lastIndex) {
            parts.push(para.substring(lastIndex, match.index));
          }

          const token = match[0];
          if (token.startsWith("**") && token.endsWith("**")) {
            parts.push(
              <strong key={`${pIdx}-${match.index}`} className="font-bold text-cyan-200">
                {token.slice(2, -2)}
              </strong>
            );
          } else if ((token.startsWith("*") && token.endsWith("*")) || (token.startsWith("_") && token.endsWith("_"))) {
            parts.push(
              <em key={`${pIdx}-${match.index}`} className="italic text-slate-200">
                {token.slice(1, -1)}
              </em>
            );
          } else if (token.startsWith("`") && token.endsWith("`")) {
            parts.push(
              <code key={`${pIdx}-${match.index}`} className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">
                {token.slice(1, -1)}
              </code>
            );
          }

          lastIndex = regex.lastIndex;
        }

        // Push trailing text
        if (lastIndex < para.length) {
          parts.push(para.substring(lastIndex));
        }

        return <p key={pIdx}>{parts}</p>;
      })}
    </div>
  );
};

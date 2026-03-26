import { useState, useRef } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Clipboard, Check, Download } from "lucide-react";

// Register only the yaml grammar — avoids pulling in the full highlight.js bundle
SyntaxHighlighter.registerLanguage("yaml", yaml);

export interface YamlBlockProps {
  code: string;
  filename?: string;
}

export function YamlBlock({ code, filename = "cogtrix.yaml" }: YamlBlockProps) {
  const [copied, setCopied] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  function handleCopy() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleDownload() {
    const blob = new Blob([code], { type: "application/x-yaml" });
    const url = URL.createObjectURL(blob);
    if (anchorRef.current) {
      anchorRef.current.href = url;
      anchorRef.current.download = filename;
      anchorRef.current.click();
    }
    URL.revokeObjectURL(url);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-700">
      {/* Hidden anchor used for programmatic download — aria-hidden keeps it out of the a11y tree */}
      <a ref={anchorRef} aria-hidden="true" className="sr-only" tabIndex={-1} />

      {/* Header bar */}
      <div className="flex items-center justify-between bg-zinc-800 px-3 py-1.5">
        <span className="font-mono text-xs text-zinc-400">YAML</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy YAML"}
            className="focus-visible:ring-ring flex h-8 w-8 items-center justify-center rounded text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 focus-visible:ring-2 focus-visible:outline-none"
          >
            {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download YAML"
            className="focus-visible:ring-ring flex h-8 w-8 items-center justify-center rounded text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 focus-visible:ring-2 focus-visible:outline-none"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Code area */}
      <div className="max-h-64 overflow-auto bg-zinc-900">
        <SyntaxHighlighter
          language="yaml"
          style={atomOneDark}
          customStyle={{ margin: 0, background: "transparent", fontSize: "0.75rem" }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default YamlBlock;

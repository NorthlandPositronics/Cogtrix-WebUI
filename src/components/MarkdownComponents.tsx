import { useState, type ReactNode } from "react";
import { Clipboard, Check } from "lucide-react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { PluggableList } from "unified";
import { Button } from "@/components/ui/button";
import type { Components } from "react-markdown";

export const REMARK_PLUGINS = [remarkGfm];
export const REHYPE_PLUGINS: PluggableList = [rehypeRaw, [rehypeSanitize, defaultSchema]];

function isSafeUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return (
      parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:"
    );
  } catch {
    return false;
  }
}

interface ReactElementWithChildren {
  props: { children?: ReactNode };
}

function hasChildren(node: unknown): node is ReactElementWithChildren {
  return (
    node !== null &&
    typeof node === "object" &&
    "props" in node &&
    node.props !== null &&
    typeof node.props === "object" &&
    "children" in (node.props as object)
  );
}

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (hasChildren(node)) return extractText(node.props.children);
  return "";
}

function CodeBlock({ children, language }: { children: ReactNode; language?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = extractText(children);
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative rounded-md border border-zinc-200 bg-zinc-50">
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="font-mono text-xs font-medium text-zinc-500">{language ?? ""}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-500 hover:text-zinc-600"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Clipboard className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto px-3 pt-0 pb-3 font-mono text-sm leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

export const markdownComponents: Components = {
  p({ children }) {
    return <p>{children}</p>;
  },
  strong({ children }) {
    return <strong className="font-bold">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic">{children}</em>;
  },
  ul({ children }) {
    return <ul className="list-disc space-y-1 pl-5 text-base text-zinc-900">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal space-y-1 pl-5 text-base text-zinc-900">{children}</ol>;
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="my-2 rounded-r-sm border-l-2 border-teal-200 bg-teal-50/40 py-1 pl-4 text-zinc-600 italic [blockquote_&]:border-teal-100 [blockquote_&]:pl-3">
        {children}
      </blockquote>
    );
  },
  h1({ children }) {
    return (
      <h1 className="mt-4 mb-2 text-xl leading-tight font-semibold text-zinc-900 [&:first-child]:mt-0">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    return (
      <h2 className="mt-4 mb-1.5 text-lg leading-tight font-semibold text-zinc-900 [&:first-child]:mt-0">
        {children}
      </h2>
    );
  },
  h3({ children }) {
    return (
      <h3 className="mt-3 mb-1 text-base leading-tight font-semibold text-zinc-900 [&:first-child]:mt-0">
        {children}
      </h3>
    );
  },
  h4({ children }) {
    return (
      <h4 className="mt-3 mb-1 text-sm leading-tight font-semibold text-zinc-700">{children}</h4>
    );
  },
  h5({ children }) {
    return (
      <h5 className="mt-2 mb-0.5 text-sm leading-tight font-medium text-zinc-600">{children}</h5>
    );
  },
  h6({ children }) {
    return (
      <h6 className="mt-2 mb-0.5 text-sm leading-tight font-medium text-zinc-500">{children}</h6>
    );
  },
  hr() {
    return <hr className="my-4 border-t border-zinc-200" />;
  },
  img({ src, alt }) {
    if (!isSafeUrl(src)) return null;
    return <img src={src} alt={alt ?? ""} className="my-2 max-w-full rounded-md" loading="lazy" />;
  },
  a({ href, children }) {
    if (!isSafeUrl(href)) {
      return <span className="text-zinc-500">{children}</span>;
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-600 underline hover:text-teal-700"
      >
        {children}
      </a>
    );
  },
  pre({ children, node }) {
    // Extract language from the code element's className (e.g. "language-python")
    const codeEl = node?.children?.[0];
    const langClass =
      codeEl && "properties" in codeEl
        ? ((codeEl.properties?.className as string[] | undefined)?.[0] ?? "")
        : "";
    const language = langClass.startsWith("language-") ? langClass.slice(9) : undefined;

    return <CodeBlock language={language}>{children}</CodeBlock>;
  },
  code({ children, className }) {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm text-zinc-900">
          {children}
        </code>
      );
    }
    return <code className={className}>{children}</code>;
  },
  table({ children }) {
    return (
      <div className="my-2 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="border-b border-zinc-200 bg-zinc-50">{children}</thead>;
  },
  tbody({ children }) {
    return <tbody>{children}</tbody>;
  },
  tr({ children }) {
    return <tr className="transition-colors duration-150 hover:bg-zinc-50">{children}</tr>;
  },
  th({ children }) {
    return (
      <th
        scope="col"
        className="px-3 py-1.5 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase"
      >
        {children}
      </th>
    );
  },
  td({ children }) {
    return <td className="border-b border-zinc-100 px-3 py-1.5 text-zinc-900">{children}</td>;
  },
};

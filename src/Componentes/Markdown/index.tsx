import React, { useEffect, useState } from 'react';
import './markdown.css';

/* ─────────────────────────────────────────────
   MARKDOWN — renderer liviano y sin dependencias
   para las respuestas de Nexia IA.
   Soporta: títulos (#…####), **negrita**, *cursiva*,
   `código`, bloques ``` ```, listas con viñetas y
   numeradas, citas (>) y enlaces [texto](url).
───────────────────────────────────────────── */

interface MarkdownProps {
  text: string;
  className?: string;
}

const INLINE_RE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
const LINK_RE = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/;

/** Render inline tokens (code, bold, italic, links) — used for non-math fragments */
function renderInlineTokens(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(INLINE_RE)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));

    const key = `${keyBase}-${i++}`;
    if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const link = token.match(LINK_RE);
      if (link) {
        nodes.push(
          <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer">
            {link[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    }
    last = index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Render inline text and process $...$ math segments if KaTeX is available. */
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const MATH_RE = /\$(.+?)\$/g;
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(MATH_RE)) {
    const match = m[0];
    const content = m[1];
    const index = m.index ?? 0;
    if (index > last) {
      const pre = text.slice(last, index);
      nodes.push(...renderInlineTokens(pre, `${keyBase}-t${i}`));
    }
    const key = `${keyBase}-math-${i}`;
    const katex = (window as any).katex;
    if (katex && typeof katex.renderToString === 'function') {
      try {
        const html = katex.renderToString(content, { throwOnError: false, displayMode: false });
        nodes.push(<span key={key} className="md-math md-math--inline" dangerouslySetInnerHTML={{ __html: html }} />);
      } catch {
        nodes.push(<code key={key}>{`$${content}$`}</code>);
      }
    } else {
      // fallback: show literal with code styling until KaTeX loads
      nodes.push(<code key={key}>{`$${content}$`}</code>);
    }
    last = index + match.length;
    i++;
  }
  if (last < text.length) {
    const rest = text.slice(last);
    nodes.push(...renderInlineTokens(rest, `${keyBase}-t${i}`));
  }
  return nodes;
}

const BULLET_RE = /^\s*[-*•]\s+(.*)$/;
const ORDERED_RE = /^\s*\d+[.)]\s+(.*)$/;
const HEADING_RE = /^(#{1,4})\s+(.*)$/;
const QUOTE_RE = /^>\s?(.*)$/;

/** Parsea el texto por bloques y lo convierte en nodos React. */
function renderBlocks(text: string): React.ReactNode[] {
  const lines = text.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let quote: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const key = `p-${blocks.length}`;
    blocks.push(
      <p key={key}>
        {paragraph.map((line, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <br />}
            {renderInline(line, `${key}-${idx}`)}
          </React.Fragment>
        ))}
      </p>
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    const key = `l-${blocks.length}`;
    const items = list.items.map((item, idx) => (
      <li key={idx}>{renderInline(item, `${key}-${idx}`)}</li>
    ));
    blocks.push(list.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>);
    list = null;
  };

  const flushQuote = () => {
    if (!quote.length) return;
    const key = `q-${blocks.length}`;
    blocks.push(
      <blockquote key={key}>
        {quote.map((line, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <br />}
            {renderInline(line, `${key}-${idx}`)}
          </React.Fragment>
        ))}
      </blockquote>
    );
    quote = [];
  };

  const flushAll = () => { flushParagraph(); flushList(); flushQuote(); };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Display math $$ ... $$ support: capture blocks delimited by $$
    if (line.trim().startsWith('$$')) {
      flushAll();
      const mathLines: string[] = [];
      let inner = line.trim().slice(2);
      // If it closes on same line like $$a+b$$
      if (inner.endsWith('$$')) {
        inner = inner.slice(0, -2);
        const katex = (window as any).katex;
        if (katex && typeof katex.renderToString === 'function') {
          try {
            const html = katex.renderToString(inner, { throwOnError: false, displayMode: true });
            blocks.push(<div key={`md-m-${blocks.length}`} className="md-math-block" dangerouslySetInnerHTML={{ __html: html }} />);
          } catch {
            blocks.push(<pre key={`md-m-${blocks.length}`}><code>{`$$${inner}$$`}</code></pre>);
          }
        } else {
          blocks.push(<pre key={`md-m-${blocks.length}`}><code>{`$$${inner}$$`}</code></pre>);
        }
        continue;
      }
      // otherwise gather until closing $$
      i++;
      while (i < lines.length && !lines[i].trim().endsWith('$$')) {
        mathLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        const lastLine = lines[i].trim();
        mathLines.push(lastLine.slice(0, lastLine.length - 2));
      }
      const mathContent = mathLines.join('\n');
      const katex = (window as any).katex;
      if (katex && typeof katex.renderToString === 'function') {
        try {
          const html = katex.renderToString(mathContent, { throwOnError: false, displayMode: true });
          blocks.push(<div key={`md-m-${blocks.length}`} className="md-math-block" dangerouslySetInnerHTML={{ __html: html }} />);
        } catch {
          blocks.push(<pre key={`md-m-${blocks.length}`}><code>{`$$${mathContent}$$`}</code></pre>);
        }
      } else {
        blocks.push(<pre key={`md-m-${blocks.length}`}><code>{`$$${mathContent}$$`}</code></pre>);
      }
      continue;
    }

    // Bloque de código ``` … ```
    if (line.trim().startsWith('```')) {
      flushAll();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      blocks.push(
        <pre key={`c-${blocks.length}`}>
          <code>{code.join('\n')}</code>
        </pre>
      );
      continue;
    }

    const heading = line.match(HEADING_RE);
    if (heading) {
      flushAll();
      const key = `h-${blocks.length}`;
      const content = renderInline(heading[2], key);
      blocks.push(
        heading[1].length <= 2
          ? <h3 key={key}>{content}</h3>
          : <h4 key={key}>{content}</h4>
      );
      continue;
    }

    const bullet = line.match(BULLET_RE);
    const ordered = line.match(ORDERED_RE);
    if (bullet || ordered) {
      flushParagraph();
      flushQuote();
      const isOrdered = Boolean(ordered);
      if (!list || list.ordered !== isOrdered) {
        flushList();
        list = { ordered: isOrdered, items: [] };
      }
      list.items.push((bullet ?? ordered)![1]);
      continue;
    }

    const quoted = line.match(QUOTE_RE);
    if (quoted) {
      flushParagraph();
      flushList();
      quote.push(quoted[1]);
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line);
  }

  flushAll();
  return blocks;
}

/**
 * Markdown component — now stateful so it can trigger a re-render when KaTeX
 * is loaded dynamically at runtime (from CDN). We keep behaviour minimal: if
 * KaTeX isn't available yet, math is shown as code, and once KaTeX loads we
 * re-render to display pretty math.
 */
const KATEX_CSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
const KATEX_JS = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';

let katexLoader: Promise<void> | null = null;
function ensureKatexLoaded(): Promise<void> {
  if ((window as any).katex) return Promise.resolve();
  if (katexLoader) return katexLoader;

  katexLoader = new Promise((resolve) => {
    // inject CSS
    if (!document.querySelector(`link[data-katex]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = KATEX_CSS;
      link.setAttribute('data-katex', '1');
      document.head.appendChild(link);
    }
    // inject JS
    if (!document.querySelector(`script[data-katex]`)) {
      const script = document.createElement('script');
      script.src = KATEX_JS;
      script.async = true;
      script.setAttribute('data-katex', '1');
      script.onload = () => resolve();
      // in case the CDN fails, still resolve to avoid blocking
      script.onerror = () => resolve();
      document.body.appendChild(script);
    } else {
      // already present but maybe not ready
      const existing: any = document.querySelector(`script[data-katex]`);
      existing.onload = () => resolve();
      existing.onerror = () => resolve();
    }
  }).then(() => {
    // small delay to allow global to be set by the loaded script
    return new Promise<void>((res) => setTimeout(res, 50));
  });

  return katexLoader;
}

const Markdown: React.FC<MarkdownProps> = ({ text, className }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // if the text contains any $ signs, try to load KaTeX so math can render
    if (text.includes('$')) {
      ensureKatexLoaded().then(() => setTick((t) => t + 1));
    }
  }, [text]);

  // tick is used only to force re-render once KaTeX becomes available
  return <div className={`md${className ? ` ${className}` : ''}`}>{renderBlocks(text)}</div>;
};

export default Markdown;

import React from 'react';
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

/** Convierte los tokens inline de una línea en nodos React. */
function renderInline(text: string, keyBase: string): React.ReactNode[] {
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

const Markdown: React.FC<MarkdownProps> = ({ text, className }) => (
  <div className={`md${className ? ` ${className}` : ''}`}>{renderBlocks(text)}</div>
);

export default Markdown;

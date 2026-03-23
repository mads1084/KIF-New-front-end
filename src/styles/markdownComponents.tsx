import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CodeProps } from "../types/interfaces";

// Normal-sized markdown components for main content
export const normalMarkdownComponents = {
  code: ({ node, inline, className, children, ...props }: CodeProps) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code
        className={`bg-opacity-5 bg-black px-1 py-0.5 rounded font-mono ${
          className || ""
        }`}
        {...props}
      >
        {children}
      </code>
    );
  },
  a: ({ node, ...props }: any) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    />
  ),
  p: ({ node, children, ...props }: any) => (
    <p {...props} className="mb-3 last:mb-0 first:mt-0 leading-relaxed">
      {children}
    </p>
  ),
  h1: ({ node, ...props }: any) => (
    <h1 {...props} className="text-2xl font-bold mt-3 mb-1" />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 {...props} className="text-xl font-bold mt-3 mb-1" />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 {...props} className="text-lg font-bold mt-2 mb-1" />
  ),
  h4: ({ node, ...props }: any) => (
    <h4 {...props} className="text-base font-bold mt-2 mb-1" />
  ),
  ul: ({ node, ...props }: any) => (
    <ul {...props} className="list-disc ml-6 mt-0 mb-1" />
  ),
  ol: ({ node, ...props }: any) => (
    <ol {...props} className="list-decimal ml-6 mt-0 mb-1" />
  ),
  li: ({ node, ...props }: any) => (
    <li {...props} className="leading-snug mb-0.5 whitespace-normal" />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      {...props}
      className="border-l-4 border-gray-300 pl-4 italic my-2"
    />
  ),
  table: ({ node, ...props }: any) => (
    <table {...props} className="border-collapse w-full my-2" />
  ),
  thead: ({ node, ...props }: any) => (
    <thead {...props} className="border-b-2 border-gray-200" />
  ),
  tbody: ({ node, ...props }: any) => <tbody {...props} />,
  tr: ({ node, ...props }: any) => (
    <tr {...props} className="even:bg-gray-50" />
  ),
  th: ({ node, ...props }: any) => (
    <th
      {...props}
      className="border border-gray-300 bg-gray-100 font-bold p-1.5 text-left"
    />
  ),
  td: ({ node, ...props }: any) => (
    <td {...props} className="border border-gray-300 p-1.5 text-left" />
  ),
};

// Small-sized markdown components for tool results and compact displays
export const smallMarkdownComponents = {
  code: ({ node, inline, className, children, ...props }: CodeProps) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code
        className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  a: ({ node, ...props }: any) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    />
  ),
  p: ({ node, children, ...props }: any) => (
    <p {...props} className="mb-2 last:mb-0 leading-relaxed">
      {children}
    </p>
  ),
  h1: ({ node, ...props }: any) => (
    <h1 {...props} className="text-sm font-bold mb-1" />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 {...props} className="text-sm font-bold mb-1" />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 {...props} className="text-sm font-semibold mb-1" />
  ),
  h4: ({ node, ...props }: any) => (
    <h4 {...props} className="text-sm font-medium mb-1" />
  ),
  ul: ({ node, ...props }: any) => (
    <ul {...props} className="list-disc ml-4 mb-1" />
  ),
  ol: ({ node, ...props }: any) => (
    <ol {...props} className="list-decimal ml-4 mb-1" />
  ),
  li: ({ node, ...props }: any) => <li {...props} className="mb-0.5" />,
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      {...props}
      className="border-l-4 border-gray-300 pl-4 italic my-2"
    />
  ),
  table: ({ node, ...props }: any) => (
    <table {...props} className="border-collapse w-full my-2" />
  ),
  thead: ({ node, ...props }: any) => (
    <thead {...props} className="border-b-2 border-gray-200" />
  ),
  tbody: ({ node, ...props }: any) => <tbody {...props} />,
  tr: ({ node, ...props }: any) => (
    <tr {...props} className="even:bg-gray-50" />
  ),
  th: ({ node, ...props }: any) => (
    <th
      {...props}
      className="border border-gray-300 bg-gray-100 font-bold p-1.5 text-left"
    />
  ),
  td: ({ node, ...props }: any) => (
    <td {...props} className="border border-gray-300 p-1.5 text-left" />
  ),
};

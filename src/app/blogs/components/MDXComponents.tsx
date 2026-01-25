import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentProps, ReactNode, CSSProperties } from "react";

interface HeadingProps {
  id?: string;
  children?: ReactNode;
}

const createHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
  const Tag = `h${level}` as const;
  // rehype-autolink-headings がリンクを追加するため、ここではシンプルにレンダリング
  const HeadingComponent = ({ id, children }: HeadingProps) => (
    <Tag id={id}>{children}</Tag>
  );
  HeadingComponent.displayName = `Heading${level}`;
  return HeadingComponent;
};

const codeBlockStyle: CSSProperties = {
  padding: "1rem",
  backgroundColor: "var(--text-color)",
  color: "var(--background-color)",
  overflowX: "auto",
  margin: "1.5rem 0",
};

const inlineCodeStyle: CSSProperties = {
  padding: "0.2rem 0.4rem",
  backgroundColor: "var(--text-color)",
  color: "var(--background-color)",
  fontFamily: "var(--font-family)",
  fontSize: "0.9em",
};

const components: MDXComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),

  a: ({ href, children, ...props }: ComponentProps<"a">) => {
    if (href?.startsWith("/")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    if (href?.startsWith("#")) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },

  pre: ({ children, ...props }: ComponentProps<"pre">) => (
    <pre style={codeBlockStyle} {...props}>
      {children}
    </pre>
  ),

  code: ({ children, className, ...props }: ComponentProps<"code">) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code style={inlineCodeStyle} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        style={{
          color: "var(--background-color)",
          fontFamily: "var(--font-family)",
          fontSize: "0.9rem",
        }}
        {...props}
      >
        {children}
      </code>
    );
  },

  img: ({ src, alt, ...props }: ComponentProps<"img">) => (
    // biome-ignore lint/a11y/useAltText: alt is passed through props
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto my-6"
      loading="lazy"
      {...props}
    />
  ),

  blockquote: ({ children, ...props }: ComponentProps<"blockquote">) => (
    <blockquote
      style={{
        margin: "1.5rem 0",
        padding: "1rem 1.5rem",
        borderLeft: "4px solid var(--border-color)",
      }}
      {...props}
    >
      {children}
    </blockquote>
  ),

  table: ({ children, ...props }: ComponentProps<"table">) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),

  th: ({ children, ...props }: ComponentProps<"th">) => (
    <th
      style={{
        padding: "0.75rem 1rem",
        border: "1px solid var(--border-color)",
        textAlign: "left",
        backgroundColor: "var(--text-color)",
        color: "var(--background-color)",
        fontWeight: 600,
      }}
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }: ComponentProps<"td">) => (
    <td
      style={{
        padding: "0.75rem 1rem",
        border: "1px solid var(--border-color)",
        textAlign: "left",
      }}
      {...props}
    >
      {children}
    </td>
  ),

  ul: ({ children, ...props }: ComponentProps<"ul">) => (
    <ul className="my-4 pl-6 list-disc" {...props}>
      {children}
    </ul>
  ),

  ol: ({ children, ...props }: ComponentProps<"ol">) => (
    <ol className="my-4 pl-6 list-decimal" {...props}>
      {children}
    </ol>
  ),

  li: ({ children, ...props }: ComponentProps<"li">) => (
    <li className="mb-2" {...props}>
      {children}
    </li>
  ),
};

export default components;

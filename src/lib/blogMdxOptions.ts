import type { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

type BlogMdxOptions = NonNullable<Parameters<typeof serialize>[1]>["mdxOptions"];

export const blogMdxOptions = {
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [
    rehypeKatex,
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: "wrap" as const }],
  ],
} as BlogMdxOptions;

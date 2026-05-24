import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export const blogMdxOptions = {
  remarkPlugins: [remarkGfm, remarkMath],
  rehypePlugins: [
    rehypeKatex,
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: "wrap" }],
  ],
};

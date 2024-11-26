import Markdown, { Options } from "react-markdown";
import remarkGfm from "remark-gfm";

export interface MarkdownTextProps extends Options {}

export function MarkdownText({ children, ...props }: MarkdownTextProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node: _node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" />
        ),
      }}
      {...props}
    >
      {children}
    </Markdown>
  );
}

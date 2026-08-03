import ReactMarkdown from "react-markdown";

export function LessonContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h2: (props) => <h2 className="mb-3 mt-6 text-lg font-bold first:mt-0" {...props} />,
        h3: (props) => <h3 className="mb-2 mt-5 font-bold" {...props} />,
        p: (props) => <p className="mb-3 leading-relaxed text-text-muted" {...props} />,
        ul: (props) => <ul className="mb-3 ml-5 list-disc space-y-1.5 text-text-muted" {...props} />,
        ol: (props) => <ol className="mb-3 ml-5 list-decimal space-y-1.5 text-text-muted" {...props} />,
        li: (props) => <li className="leading-relaxed" {...props} />,
        strong: (props) => <strong className="font-semibold text-text" {...props} />,
        em: (props) => <em className="italic" {...props} />,
        blockquote: (props) => (
          <blockquote
            className="mb-3 border-l-2 border-accent pl-4 text-text-muted italic"
            {...props}
          />
        ),
        code: (props) => (
          <code className="rounded bg-bg-soft px-1.5 py-0.5 font-mono text-sm" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

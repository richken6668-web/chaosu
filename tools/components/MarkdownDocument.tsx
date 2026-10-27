import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export type MarkdownTheme = 'light' | 'dark'

interface MarkdownDocumentProps {
  content: string
  theme?: MarkdownTheme
  className?: string
}

export default function MarkdownDocument({
  content,
  theme = 'light',
  className = '',
}: MarkdownDocumentProps) {
  return (
    <div className={`tool-markdown tool-markdown-${theme} ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

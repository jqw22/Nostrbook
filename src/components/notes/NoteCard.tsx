import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EncryptedNote } from '@/hooks/useEncryptedNotes';

function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="text-sm text-muted-foreground line-clamp-3 [&_*]:inline [&_*]:whitespace-normal">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <strong>{children} </strong>,
          h2: ({ children }) => <strong>{children} </strong>,
          h3: ({ children }) => <strong>{children} </strong>,
          p: ({ children }) => <span>{children} </span>,
          ul: ({ children }) => <span>{children}</span>,
          ol: ({ children }) => <span>{children}</span>,
          li: ({ children }) => <span>• {children} </span>,
          hr: () => <span className="mx-1">—</span>,
          blockquote: ({ children }) => (
            <span className="italic">{children}</span>
          ),
          code: ({ children }) => (
            <code className="bg-muted rounded px-0.5 text-xs">{children}</code>
          ),
          pre: ({ children }) => <span>{children}</span>,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}

export interface NoteCardProps {
  note: EncryptedNote;
  onClick: () => void;
  className?: string;
}

export function NoteCard({ note, onClick, className }: NoteCardProps) {
  const { data, tags } = note;

  const formattedDate = new Date(data.updated_at * 1000).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric', year: 'numeric' },
  );

  const hasFollowUp = !!data.follow_up_date;
  const followUpDate = hasFollowUp
    ? new Date(data.follow_up_date! * 1000).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:border-primary/30 motion-safe:transition-colors',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        hasFollowUp && 'bg-pink-50 border-pink-200',
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight line-clamp-2">
            {data.title || 'Untitled Note'}
          </h3>
          {hasFollowUp && followUpDate && (
            <span className="shrink-0 flex items-center gap-1 text-xs text-pink-700 bg-pink-100 rounded-md px-2 py-1 font-medium">
              <Calendar className="h-3 w-3" />
              {followUpDate}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.content && <MarkdownPreview content={data.content} />}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">
                No tags
              </span>
            )}
          </div>
          <time
            dateTime={new Date(data.updated_at * 1000).toISOString()}
            className="text-xs text-muted-foreground shrink-0"
          >
            {formattedDate}
          </time>
        </div>
      </CardContent>
    </Card>
  );
}

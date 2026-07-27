import { useCallback } from 'react';
import { Bold, Italic, List, ListOrdered, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NoteToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onFormat: (insertion: { before: string; after: string }) => void;
  className?: string;
}

const tools = [
  {
    icon: Bold,
    label: 'Bold',
    before: '**',
    after: '**',
  },
  {
    icon: Italic,
    label: 'Italic',
    before: '*',
    after: '*',
  },
  {
    icon: Underline,
    label: 'Underline',
    before: '<u>',
    after: '</u>',
  },
  {
    icon: List,
    label: 'Bullet list',
    before: '\n- ',
    after: '',
  },
  {
    icon: ListOrdered,
    label: 'Numbered list',
    before: '\n1. ',
    after: '',
  },
] as const;

export function NoteToolbar({ textareaRef, onFormat, className }: NoteToolbarProps) {
  const handleToolClick = useCallback(
    (before: string, after: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      onFormat({ before, after });

      // Restore focus and adjust selection
      requestAnimationFrame(() => {
        textarea.focus();
        const start = textarea.selectionStart;
        const selectedLen = textarea.selectionEnd - start;
        const newStart = start + before.length;
        const newEnd = start + before.length + selectedLen;
        textarea.setSelectionRange(newStart, newEnd);
      });
    },
    [textareaRef, onFormat],
  );

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-t-md border border-b-0 border-input bg-muted/40 px-1 py-1',
        className,
      )}
    >
      {tools.map(({ icon: Icon, label, before, after }) => (
        <Button
          key={label}
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-sm hover:bg-muted"
          aria-label={label}
          onClick={() => handleToolClick(before, after)}
        >
          <Icon className="h-3.5 w-3.5" />
        </Button>
      ))}
    </div>
  );
}

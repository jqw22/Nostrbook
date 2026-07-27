import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2, Trash2, Calendar } from 'lucide-react';
import type { EncryptedNote } from '@/hooks/useEncryptedNotes';

export interface NoteEditorProps {
  /** Existing note to edit, or undefined for a new note. */
  note?: EncryptedNote;
  isOpen: boolean;
  onClose: () => void;
  onSave: (params: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    follow_up_date?: number | null;
  }) => void;
  onDelete?: (id: string) => void;
  isSaving?: boolean;
  isDeleting?: boolean;
}

export function NoteEditor({
  note,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
}: NoteEditorProps) {
  const isNew = !note;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Reset form when dialog opens with a different note
  useEffect(() => {
    if (isOpen) {
      setTitle(note?.data.title ?? '');
      setContent(note?.data.content ?? '');
      setTags(note?.tags ?? []);
      setTagInput('');
      setFollowUpDate(
        note?.data.follow_up_date
          ? new Date(note.data.follow_up_date * 1000).toISOString().slice(0, 10)
          : '',
      );
    }
  }, [isOpen, note]);

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag();
      }
      if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
        removeTag(tags[tags.length - 1]);
      }
    },
    [addTag, tagInput, tags, removeTag],
  );

  const handleSave = () => {
    const followUpTimestamp = followUpDate
      ? Math.floor(new Date(followUpDate + 'T00:00:00').getTime() / 1000)
      : null;
    onSave({
      id: note ? note.event.tags.find(([n]) => n === 'd')?.[1] ?? '' : crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      tags,
      follow_up_date: followUpTimestamp,
    });
  };

  const handleDelete = () => {
    if (note && onDelete) {
      const noteId = note.event.tags.find(([n]) => n === 'd')?.[1];
      if (noteId) onDelete(noteId);
    }
  };

  const existingFollowUpStr = note?.data.follow_up_date
    ? new Date(note.data.follow_up_date * 1000).toISOString().slice(0, 10)
    : '';

  const hasChanges = isNew
    ? title.trim() || content.trim() || tags.length > 0 || followUpDate
    : title.trim() !== (note?.data.title ?? '') ||
      content.trim() !== (note?.data.content ?? '') ||
      JSON.stringify(tags) !== JSON.stringify(note?.tags ?? []) ||
      followUpDate !== existingFollowUpStr;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isNew ? 'New Note' : 'Edit Note'}</DialogTitle>
          <DialogDescription>
            {isNew
              ? 'Your note is encrypted with NIP-44 and stored privately on your relays.'
              : 'Edit your encrypted note. Changes are encrypted before publishing.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-2">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="note-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-lg"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label htmlFor="note-content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your private note here..."
              className="min-h-[200px] resize-y"
            />
          </div>

          {/* Follow-up date */}
          <div className="space-y-2">
            <label htmlFor="note-followup" className="text-sm font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              Follow-up date
              <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="note-followup"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="max-w-[200px]"
              />
              {followUpDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFollowUpDate('')}
                  className="text-xs text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="note-tags" className="text-sm font-medium">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-2 min-h-[42px] focus-within:ring-1 focus-within:ring-ring">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                id="note-tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? 'Add tags...' : ''}
                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add a tag. Tags are stored in cleartext for filtering.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {!isNew && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              className="mr-auto"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="ml-1.5">Delete</span>
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isSaving ? 'Encrypting & Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

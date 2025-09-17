'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

function RichTextEditor({
  content,
  onChange,
  placeholder = 'Digite a letra do hino...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input rounded-md">
      <div className="border-b p-2 flex gap-1 flex-wrap">
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-9 rounded-md px-3 hover:bg-accent hover:text-accent-foreground touch-manipulation ${editor.isActive('bold') ? 'bg-accent' : 'bg-transparent'}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-9 rounded-md px-3 hover:bg-accent hover:text-accent-foreground touch-manipulation ${editor.isActive('italic') ? 'bg-accent' : 'bg-transparent'}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-9 rounded-md px-3 hover:bg-accent hover:text-accent-foreground touch-manipulation ${editor.isActive('bulletList') ? 'bg-accent' : 'bg-transparent'}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-9 rounded-md px-3 hover:bg-accent hover:text-accent-foreground touch-manipulation ${editor.isActive('orderedList') ? 'bg-accent' : 'bg-transparent'}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-9 rounded-md px-3 hover:bg-accent hover:text-accent-foreground touch-manipulation ${editor.isActive('blockquote') ? 'bg-accent' : 'bg-transparent'}`}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-9 rounded-md px-3 hover:bg-accent hover:text-accent-foreground bg-transparent disabled:opacity-50 touch-manipulation"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-9 rounded-md px-3 hover:bg-accent hover:text-accent-foreground bg-transparent disabled:opacity-50 touch-manipulation"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[150px] sm:min-h-[200px] p-3 prose prose-sm max-w-none focus-within:outline-none"
      />
    </div>
  );
}

export { RichTextEditor };
export default RichTextEditor;
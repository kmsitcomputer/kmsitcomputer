import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, List, ListOrdered,
  Quote, FileCode, Undo2, Redo2, Link as LinkIcon, ImagePlus, Youtube as YoutubeIcon,
  AlignLeft, AlignCenter, Heading2, Type, Minus,
} from "lucide-react";
import { useState } from "react";
import { cx, Modal, Field, TextInput } from "./ui";
import { ytId } from "../lib/db";

function TBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className={cx("rounded-md p-1.5 transition-colors", active ? "bg-brand-500/15 text-brand-700 dark:text-brand-300" : "text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-700 dark:hover:text-ink-100")}>
      {children}
    </button>
  );
}
const Sep = () => <span className="w-px h-5 bg-ink-200 dark:bg-ink-700 mx-1 shrink-0" />;

export function RichEditor({ value, onChange, placeholder, compact }: { value: string; onChange: (html: string) => void; placeholder?: string; compact?: boolean }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imgOpen, setImgOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [ytOpen, setYtOpen] = useState(false);
  const [ytUrl, setYtUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false }),
      Youtube.configure({ controls: true, width: 640, height: 360 }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "Tulis konten di sini…" }),
    ],
    content: value,
    editorProps: { attributes: { class: "tiptap-editor" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-ink-200 dark:border-ink-700 bg-card dark:bg-ink-900 overflow-hidden focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-shadow">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-850">
        <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={15} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={15} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><UnderlineIcon size={15} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><Strikethrough size={15} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code"><Code size={15} /></TBtn>
        <Sep />
        <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 size={15} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} title="Paragraph"><Type size={15} /></TBtn>
        <Sep />
        <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List size={15} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list"><ListOrdered size={15} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><Quote size={15} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block"><FileCode size={15} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={15} /></TBtn>
        {!compact && (
          <>
            <Sep />
            <TBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left"><AlignLeft size={15} /></TBtn>
            <TBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center"><AlignCenter size={15} /></TBtn>
            <Sep />
            <TBtn onClick={() => { setLinkUrl(editor.getAttributes("link").href ?? ""); setLinkOpen(true); }} active={editor.isActive("link")} title="Link"><LinkIcon size={15} /></TBtn>
            <TBtn onClick={() => { setImgUrl(""); setImgOpen(true); }} title="Image"><ImagePlus size={15} /></TBtn>
            <TBtn onClick={() => { setYtUrl(""); setYtOpen(true); }} title="YouTube embed"><YoutubeIcon size={15} /></TBtn>
          </>
        )}
        <span className="grow" />
        <TBtn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 size={15} /></TBtn>
        <TBtn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 size={15} /></TBtn>
      </div>
      <EditorContent editor={editor} />

      <Modal open={linkOpen} onClose={() => setLinkOpen(false)} title="Sisipkan Link"
        footer={<>
          <button className="h-9 px-3 rounded-lg text-sm font-semibold text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }}>Hapus link</button>
          <button className="h-9 px-4 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
            onClick={() => { if (linkUrl) editor.chain().focus().setLink({ href: linkUrl }).run(); setLinkOpen(false); }}>Pasang</button>
        </>}>
        <Field label="URL"><TextInput autoFocus value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" /></Field>
      </Modal>
      <Modal open={imgOpen} onClose={() => setImgOpen(false)} title="Sisipkan Gambar"
        footer={<button className="h-9 px-4 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
          onClick={() => { if (imgUrl) editor.chain().focus().setImage({ src: imgUrl }).run(); setImgOpen(false); }}>Sisipkan</button>}>
        <Field label="URL Gambar"><TextInput autoFocus value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://…/foto.jpg" /></Field>
      </Modal>
      <Modal open={ytOpen} onClose={() => setYtOpen(false)} title="Sisipkan YouTube"
        footer={<button className="h-9 px-4 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
          disabled={!ytId(ytUrl)}
          onClick={() => { const id = ytId(ytUrl); if (id) editor.chain().focus().setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${id}` }).run(); setYtOpen(false); }}>Sisipkan</button>}>
        <Field label="URL YouTube" hint="Mendukung youtube.com/watch, youtu.be, dan shorts."><TextInput autoFocus value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} placeholder="https://youtu.be/…" /></Field>
      </Modal>
    </div>
  );
}

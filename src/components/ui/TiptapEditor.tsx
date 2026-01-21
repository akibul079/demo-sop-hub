import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Underline as UnderlineIcon, List, Link as LinkIcon,
    Image as ImageIcon, Sparkles, Loader2, Heading1, Heading2,
    Quote, Code, ListOrdered
} from 'lucide-react';
import OpenAI from 'openai';

interface TiptapEditorProps {
    content: string;
    onChange: (html: string) => void;
    editable?: boolean;
    placeholder?: string;
    className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    const [activeDropdown, setActiveDropdown] = useState<'ai' | null>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    if (!editor) {
        return null;
    }

    const handleAISubmit = async () => {
        if (!aiPrompt.trim()) return;
        setIsAiLoading(true);
        try {
            const apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || (process as any).env?.API_KEY || '';
            if (!apiKey) {
                alert("OpenAI API Key not found. Please configure VITE_OPENAI_API_KEY.");
                return;
            }
            const openai = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true
            });

            const prompt = `Task: ${aiPrompt}\n\nPlease respond with text suitable for an SOP step. Keep it concise.`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }]
            });

            const responseText = response.choices[0].message.content;
            if (responseText) {
                editor.chain().focus().insertContent(responseText).run();
            }
            setAiPrompt('');
            setActiveDropdown(null);
        } catch (e) {
            console.error(e);
            alert(`AI Generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-white rounded-t-lg z-20 relative">
            {/* AI Assistant */}
            <div className="relative">
                <button
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => setActiveDropdown(prev => prev === 'ai' ? null : 'ai')}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded border transition-all ${activeDropdown === 'ai' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100 border-gray-200 text-black shadow-sm'}`}
                >
                    {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} AI
                </button>
                {activeDropdown === 'ai' && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-black rounded shadow-2xl p-3 z-50 w-72 animate-fadeIn">
                        <textarea
                            autoFocus
                            value={aiPrompt}
                            onChange={e => setAiPrompt(e.target.value)}
                            placeholder="What should I write?"
                            className="w-full p-2 text-xs border border-gray-200 rounded outline-none h-20 text-black mb-2 resize-none"
                        />
                        <button
                            disabled={isAiLoading}
                            onClick={handleAISubmit}
                            className="w-full bg-black text-white text-xs font-bold py-2 rounded hover:bg-gray-800 flex items-center justify-center gap-2"
                        >
                            Generate
                        </button>
                    </div>
                )}
            </div>

            <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>

            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-1.5 rounded ${editor.isActive('bold') ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Bold"
            >
                <Bold size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded ${editor.isActive('italic') ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Italic"
            >
                <Italic size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded ${editor.isActive('underline') ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Underline"
            >
                <UnderlineIcon size={14} />
            </button>

            <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1.5 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Heading 1"
            >
                <Heading1 size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Heading 2"
            >
                <Heading2 size={14} />
            </button>

            <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded ${editor.isActive('bulletList') ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Bullet List"
            >
                <List size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded ${editor.isActive('orderedList') ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Ordered List"
            >
                <ListOrdered size={14} />
            </button>

            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded ${editor.isActive('blockquote') ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Blockquote"
            >
                <Quote size={14} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-1.5 rounded ${editor.isActive('codeBlock') ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                title="Code Block"
            >
                <Code size={14} />
            </button>
        </div>
    );
};

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
    content,
    onChange,
    editable = true,
    placeholder = 'Write something...',
    className = ''
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false }),
            Image,
            TaskList,
            TaskItem.configure({ nested: true }),
            Placeholder.configure({ placeholder }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            // Use getHTML() to store rich text
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] px-4 py-3',
            },
        },
    });

    // Handle external content updates
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            if (!editor.isFocused && content) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    // Update editable state
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editable, editor]);

    return (
        <div className={`border border-gray-200 rounded-lg bg-white shadow-sm flex flex-col ${className}`}>
            {editable && <MenuBar editor={editor} />}
            <div className="flex-1 overflow-y-auto cursor-text">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

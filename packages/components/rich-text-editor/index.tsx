'use client';

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// 1. Critical: Disable SSR to prevent the "huge arrows" and hydration bugs
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="h-[250px] bg-gray-800 animate-pulse rounded-md" />
});

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  // 2. Memoize modules so the toolbar doesn't re-render and steal focus
  const modules = useMemo(() => ({
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  }), []);

  return (
    <div className="relative rich-text-editor-container">
      <ReactQuill
        theme="snow"
        value={value || ''} // Use value from props directly
        onChange={onChange}    // Use onChange from props directly
        modules={modules}
        placeholder="Write at least 100 words..."
      />

      <style>{`
        .rich-text-editor-container .ql-container {
          min-height: 250px;
          border-color: #444 !important;
          color: white;
          font-size: 16px;
        }
        .rich-text-editor-container .ql-toolbar {
          border-color: #444 !important;
          background: #222 !important;
        }
        .rich-text-editor-container .ql-editor {
          min-height: 250px;
        }
        .rich-text-editor-container .ql-stroke { stroke: white !important; }
        .rich-text-editor-container .ql-fill { fill: white !important; }
        .rich-text-editor-container .ql-picker { color: white !important; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
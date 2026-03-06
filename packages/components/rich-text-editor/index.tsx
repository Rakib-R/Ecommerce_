
'use client';

import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const [editorValue, setEditorValue] = useState(value);
  const quillRef = useRef<any>(null);

  // Ensure only one toolbar is present
  // useEffect(() => {
  //   if (!quillRef.current) {
  //     quillRef.current = true;

  //     setTimeout(() => {
  //       document.querySelectorAll(".ql-toolbar").forEach((toolbar, index) => {
  //         if (index > 0) {
  //           toolbar.remove(); // Remove extra toolbars
  //         }
  //       });
  //     }, 100); // Short delay ensures Quill is fully initialized
  //   }
  // }, []);

  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  return (
    <div className="relative">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={modules}
        placeholder="Write a detailed product description here..."
        className="bg-transparent border text-white rounded-md"
        style={{ minHeight: "250px" }}
      />

      <style>{`
        .ql-toolbar {
          background: transparent !important;
          border-color: #444 !important;
        }

        .ql-container {
          background: transparent !important;
          border-color: #444 !important;
          color: white;
        }

        .ql-editor {
          min-height: 250px;
          color: white;
        }

        .ql-editor.ql-blank::before {
          color: #aaa !important;
        }

        .ql-snow {
          border-color: #444 !important;
        }

        .ql-picker {
          color: white !important;
        }

        .ql-picker-options {
          background: #333 !important;
          color: white !important;
        }

        .ql-picker-item {
          color: white !important;
        }

        .ql-stroke {
          stroke: white !important;
        }

        .ql-fill {
          fill: white !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
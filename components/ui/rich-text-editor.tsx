"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  function runCommand(command: string) {
    document.execCommand(command);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" onClick={() => runCommand("bold")}>B</Button>
        <Button type="button" variant="ghost" onClick={() => runCommand("italic")}>I</Button>
        <Button type="button" variant="ghost" onClick={() => runCommand("insertUnorderedList")}>List</Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        className="min-h-64 rounded-soft border border-border bg-white/70 p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

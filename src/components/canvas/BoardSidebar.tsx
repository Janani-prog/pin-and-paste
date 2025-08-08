import React, { useMemo, useState } from "react";
import { useBoards } from "@/contexts/BoardsContext";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, ImageIcon, Link as LinkIcon, FilePlus2, StickyNote } from "lucide-react";

export const BoardSidebar: React.FC<{ onAddNote: () => void; onAddImage: (f: File) => void; onAddFile: (f: File) => void; onAddLink: (url: string) => void; }> = ({ onAddNote, onAddImage, onAddFile, onAddLink }) => {
  const { state, dispatch } = useBoards();
  const [newBoardName, setNewBoardName] = useState("");
  const activeId = state.activeBoardId;

  const inputId = useMemo(() => `image-input-${Math.random().toString(36).slice(2)}`,[ ]);
  const fileId = useMemo(() => `file-input-${Math.random().toString(36).slice(2)}`,[ ]);

  return (
    <aside className="h-[calc(100vh-64px)] w-72 border-r border-border p-3 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-5 opacity-70" />
          <h2 className="text-sm font-semibold">Boards</h2>
        </div>
        <Button size="sm" variant="glass" onClick={() => dispatch({ type: "ADD_BOARD", name: newBoardName || undefined })}>
          <Plus />
        </Button>
      </div>

      <div className="space-y-1 overflow-auto">
        {state.boards.map((b) => (
          <button
            key={b.id}
            onClick={() => dispatch({ type: "SET_ACTIVE", id: b.id })}
            className={`w-full text-left px-3 py-2 rounded-md border ${activeId === b.id ? "bg-accent text-accent-foreground border-border" : "bg-background border-border"}`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <input
          className="w-full px-3 py-2 rounded-md border border-border bg-background"
          placeholder="Name new board"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
        />
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className="size-5 opacity-70" />
          <span className="text-sm font-semibold">Add to board</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onAddNote}><StickyNote /> Note</Button>

          <label htmlFor={inputId}>
            <input id={inputId} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAddImage(f);
              e.currentTarget.value = "";
            }} />
            <Button asChild variant="secondary"><span><ImageIcon /> Image</span></Button>
          </label>

          <label htmlFor={fileId}>
            <input id={fileId} type="file" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onAddFile(f);
              e.currentTarget.value = "";
            }} />
            <Button asChild variant="secondary"><span><FilePlus2 /> File</span></Button>
          </label>

          <Button variant="secondary" onClick={() => {
            const url = window.prompt("Paste link URL");
            if (url) onAddLink(url);
          }}><LinkIcon /> Link</Button>
        </div>
      </div>
    </aside>
  );
};

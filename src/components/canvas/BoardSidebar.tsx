import React, { useMemo, useState } from "react";
import { useBoards } from "@/contexts/BoardsContext";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, ImageIcon, Link as LinkIcon, FilePlus2, StickyNote, Pencil, Trash2, Check, X } from "lucide-react";

export const BoardSidebar: React.FC<{ onAddNote: () => void; onAddImage: (f: File) => void; onAddFile: (f: File) => void; onAddLink: (url: string) => void; }> = ({ onAddNote, onAddImage, onAddFile, onAddLink }) => {
  const { state, dispatch } = useBoards();
  const [newBoardName, setNewBoardName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const activeId = state.activeBoardId;

  const inputId = useMemo(() => `image-input-${Math.random().toString(36).slice(2)}`,[ ]);
  const fileId = useMemo(() => `file-input-${Math.random().toString(36).slice(2)}`,[ ]);

  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl w-64">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="size-4 text-white/70" />
        <span className="text-white/90 text-sm font-medium">Add to Board</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="secondary" 
          size="sm"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center gap-1"
          onClick={onAddNote}
        >
          <StickyNote className="size-3" /> Note
        </Button>

        <label htmlFor={inputId}>
          <input id={inputId} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onAddImage(f);
            e.currentTarget.value = "";
          }} />
          <Button 
            asChild 
            variant="secondary" 
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 w-full"
          >
            <span className="flex items-center gap-1">
              <ImageIcon className="size-3" /> Image
            </span>
          </Button>
        </label>

        <label htmlFor={fileId}>
          <input id={fileId} type="file" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onAddFile(f);
            e.currentTarget.value = "";
          }} />
          <Button 
            asChild 
            variant="secondary" 
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 w-full"
          >
            <span className="flex items-center gap-1">
              <FilePlus2 className="size-3" /> File
            </span>
          </Button>
        </label>

        <Button 
          variant="secondary" 
          size="sm"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center gap-1"
          onClick={() => {
            const url = window.prompt("Paste link URL");
            if (url) onAddLink(url);
          }}
        >
          <LinkIcon className="size-3" /> Link
        </Button>
      </div>
    </div>
  );
};

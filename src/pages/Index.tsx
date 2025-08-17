import { Button } from "@/components/ui/button";
import { BoardsProvider, useBoards } from "@/contexts/BoardsContext";
import { BoardCanvas } from "@/components/canvas/BoardCanvas";
import { BoardSidebar } from "@/components/canvas/BoardSidebar";
import { Layers, Palette, Eye, EyeOff, Pencil, Trash2, Check, X } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";

function usePushpinSound() {
  return useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = 440;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      o.start();
      o.stop(ctx.currentTime + 0.13);
    } catch {}
  }, []);
}

const AppShell = () => {
  const { state, dispatch } = useBoards();
  const board = state.boards.find((b) => b.id === state.activeBoardId);
  const play = usePushpinSound();
  const [showControls, setShowControls] = useState(true);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editBoardName, setEditBoardName] = useState("");

  if (!board) return null;

  const addNote = () => {
    const id = nanoid(8);
    dispatch({
      type: "ADD_ITEM",
      boardId: board.id,
      item: {
        id,
        type: "note",
        text: "New note",
        x: 140,
        y: 140,
        width: 220,
        height: 140,
        rotation: Math.round(Math.random() * 6 - 3),
        color: "hsl(var(--note-pink))",
        pinStyle: "pin",
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
    play();
  };

  const addImage = (file: File) => {
    const url = URL.createObjectURL(file);
    dispatch({
      type: "ADD_ITEM",
      boardId: board.id,
      item: {
        id: nanoid(8),
        type: "image",
        src: url,
        name: file.name,
        x: 220,
        y: 180,
        width: 280,
        height: 200,
        rotation: 0,
        pinStyle: "tape",
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
    play();
  };

  const addFile = (file: File) => {
    const url = URL.createObjectURL(file);
    dispatch({
      type: "ADD_ITEM",
      boardId: board.id,
      item: {
        id: nanoid(8),
        type: "file",
        name: file.name,
        url,
        mime: file.type || "file",
        x: 300,
        y: 260,
        width: 220,
        height: 140,
        rotation: 1,
        pinStyle: "clip",
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
    play();
  };

  const addLink = (url: string) => {
    dispatch({
      type: "ADD_ITEM",
      boardId: board.id,
      item: {
        id: nanoid(8),
        type: "link",
        url,
        title: url.replace(/^https?:\/\//, ""),
        x: 180,
        y: 260,
        width: 260,
        height: 120,
        rotation: -1,
        pinStyle: "pin",
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
    play();
  };

  return (
    <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
      {/* Toggle controls button - always visible */}
      <div className="absolute top-6 right-1/2 translate-x-1/2 z-30">
        <Button
          variant="secondary"
          size="sm"
          className="bg-black/40 hover:bg-black/60 text-white border-white/20 backdrop-blur-md"
          onClick={() => setShowControls(!showControls)}
        >
          {showControls ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>

      {showControls && (
        <>
          {/* Floating board selector in top-left corner */}
          <div className="absolute top-6 left-6 z-20">
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="size-4 text-white/70" />
                <span className="text-white/90 text-sm font-medium">Boards</span>
              </div>
              
              {/* Board list with rename/delete functionality */}
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {state.boards.map((b) => (
                  <div key={b.id} className={`group flex items-center gap-2 px-2 py-2 rounded-lg border ${state.activeBoardId === b.id ? "bg-white/20 text-white border-white/30" : "bg-black/20 text-white/80 border-white/10"}`}>
                    {editingBoardId === b.id ? (
                      <form
                        className="flex items-center gap-1 w-full"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const name = editBoardName.trim();
                          if (name) {
                            dispatch({ type: "RENAME_BOARD", id: b.id, name });
                            setEditingBoardId(null);
                            setEditBoardName("");
                          }
                        }}
                      >
                        <input
                          className="flex-1 px-2 py-1 rounded border bg-black/30 border-white/20 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white/30"
                          value={editBoardName}
                          onChange={(e) => setEditBoardName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setEditingBoardId(null);
                              setEditBoardName("");
                            }
                          }}
                        />
                        <Button size="sm" variant="secondary" className="bg-green-600/50 hover:bg-green-600/70 text-white border-green-500/30 h-6 w-6 p-0" type="submit">
                          <Check className="size-3" />
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-red-600/50 hover:bg-red-600/70 text-white border-red-500/30 h-6 w-6 p-0" type="button" onClick={() => { setEditingBoardId(null); setEditBoardName(""); }}>
                          <X className="size-3" />
                        </Button>
                      </form>
                    ) : (
                      <>
                        <button
                          onClick={() => dispatch({ type: "SET_ACTIVE", id: b.id })}
                          className="flex-1 text-left text-sm truncate"
                        >
                          {b.name}
                        </button>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-6 w-6 p-0" 
                            onClick={() => { setEditingBoardId(b.id); setEditBoardName(b.name); }}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="bg-red-600/50 hover:bg-red-600/70 text-white border-red-500/30 h-6 w-6 p-0" 
                            onClick={() => {
                              if (state.boards.length <= 1) { 
                                window.alert("You can't delete the only board."); 
                                return; 
                              }
                              const ok = window.confirm(`Delete board "${b.name}"?`);
                              if (ok) {
                                dispatch({ type: "DELETE_BOARD", id: b.id });
                              }
                            }}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                onClick={() => dispatch({ type: "ADD_BOARD" })}
              >
                <Layers className="size-3 mr-1" />
                New Board
              </Button>
            </div>
          </div>

          {/* Floating texture selector in top-right corner */}
          <div className="absolute top-6 right-6 z-20">
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="size-4 text-white/70" />
                <span className="text-white/90 text-sm font-medium">Texture</span>
              </div>
              <select
                className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 z-50"
                value={board.texture}
                onChange={(e) => dispatch({ type: "UPDATE_BOARD", id: board.id, patch: { texture: e.target.value as any } })}
              >
                <option value="cork" className="bg-neutral-800 text-white">Corkboard</option>
                <option value="wood" className="bg-neutral-800 text-white">Dark Wood</option>
                <option value="linen" className="bg-neutral-800 text-white">White Linen</option>
              </select>
            </div>
          </div>

          {/* Floating tools sidebar in bottom-left */}
          <div className="absolute bottom-6 left-6 z-20">
            <BoardSidebar onAddNote={addNote} onAddImage={addImage} onAddFile={addFile} onAddLink={addLink} />
          </div>
        </>
      )}

      {/* Full-screen board canvas */}
      <BoardCanvas />
    </div>
  );
};

const Index = () => {
  return (
    <BoardsProvider>
      <AppShell />
    </BoardsProvider>
  );
};

export default Index;

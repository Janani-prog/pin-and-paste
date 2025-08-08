import { Button } from "@/components/ui/button";
import { BoardsProvider, useBoards } from "@/contexts/BoardsContext";
import { BoardCanvas } from "@/components/canvas/BoardCanvas";
import { BoardSidebar } from "@/components/canvas/BoardSidebar";
import { Layers, Palette } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback } from "react";

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
    <div className="min-h-screen">
      <header className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Layers className="size-6" />
          <h1 className="text-xl font-bold">Canvas — Lifelike Bulletin Board</h1>
        </div>
        <div className="flex items-center gap-2">
          <Palette className="size-4 opacity-70" />
          <select
            className="px-3 py-2 rounded-md border border-border bg-background"
            value={board.texture}
            onChange={(e) => dispatch({ type: "UPDATE_BOARD", id: board.id, patch: { texture: e.target.value as any } })}
            aria-label="Board background"
          >
            <option value="cork">Corkboard</option>
            <option value="wood">Dark Wood</option>
            <option value="linen">White Linen</option>
          </select>
          <Button variant="hero" onClick={() => dispatch({ type: "ADD_BOARD" })}>New Board</Button>
        </div>
      </header>

      <div className="grid grid-cols-[18rem_1fr]">
        <BoardSidebar onAddNote={addNote} onAddImage={addImage} onAddFile={addFile} onAddLink={addLink} />
        <BoardCanvas />
      </div>
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

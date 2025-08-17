import React, { useMemo, useState } from "react";
import { useBoards, BoardItem, NoteItem, ImageItem, FileItem, LinkItem } from "@/contexts/BoardsContext";
import { Rnd } from "react-rnd";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, RotateCw, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import cork from "@/assets/textures/cork.jpg";
import wood from "@/assets/textures/wood.jpg";
import linen from "@/assets/textures/linen.jpg";

const ItemShell: React.FC<{
  item: BoardItem;
  onChange: (patch: Partial<BoardItem>) => void;
  onDelete: () => void;
  children?: React.ReactNode;
}> = ({ item, onChange, onDelete, children }) => {
  const [selected, setSelected] = useState(false);

  return (
    <Rnd
      size={{ width: item.width, height: item.height }}
      position={{ x: item.x, y: item.y }}
      onDragStop={(_, d) => onChange({ x: d.x, y: d.y })}
      onResizeStop={(_, __, ref, ___, pos) =>
        onChange({ width: ref.offsetWidth, height: ref.offsetHeight, x: pos.x, y: pos.y })
      }
      bounds="parent"
      onMouseDown={() => setSelected(true)}
      onBlur={() => setSelected(false)}
      style={{ zIndex: selected ? 5 : 1 }}
      className={cn(
        "select-none",
      )}
    >
      <div
        className="relative w-full h-full"
        style={{ transform: `rotate(${item.rotation}deg)`, transformOrigin: "center" }}
      >
        {/* Pin styles */}
        {item.pinStyle === "pin" && (
          <span className="pin-dot pin-red absolute -top-2 left-1/2 -translate-x-1/2" aria-hidden />
        )}
        {item.pinStyle === "tape" && (
          <span className="tape-beige absolute -top-3 left-7 rotate-[-8deg] px-8 py-1 opacity-80 shadow-sm" aria-hidden />
        )}

        <div
          className="w-full h-full rounded-md shadow-[var(--shadow-soft)] border border-border overflow-hidden"
          style={{ background: item.color }}
        >
          {children}
        </div>

        {selected && (
          <div className="absolute -top-10 left-0 right-0 mx-auto flex w-max items-center gap-2 p-1 rounded-md bg-background/80 backdrop-blur border border-border shadow-sm animate-fade-in">
            <Button variant="glass" size="sm" onClick={() => onChange({ rotation: (item.rotation + 5) % 360 })} aria-label="Rotate">
              <RotateCw className="opacity-80" />
            </Button>
            <Button variant="glass" size="sm" onClick={onDelete} aria-label="Delete">
              <Trash2 className="opacity-80" />
            </Button>
          </div>
        )}
      </div>
    </Rnd>
  );
};

const StickyNoteView: React.FC<{ item: NoteItem; onChange: (p: Partial<NoteItem>) => void }> = ({ item, onChange }) => {
  const [editing, setEditing] = useState(false);
  return (
    <div
      className="w-full h-full p-3"
      onDoubleClick={() => setEditing(true)}
      onBlur={() => setEditing(false)}
    >
      {editing ? (
        <textarea
          className="w-full h-full bg-transparent outline-none resize-none"
          value={item.text}
          onChange={(e) => onChange({ text: e.target.value })}
          autoFocus
        />
      ) : (
        <p className="whitespace-pre-wrap leading-relaxed">{item.text}</p>
      )}
    </div>
  );
};

const ImagePinView: React.FC<{ item: ImageItem }> = ({ item }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
      <img src={item.src} alt={item.alt || item.name || "Pinned image"} loading="lazy" className="max-w-full max-h-full object-contain" />
    </div>
  );
};

const FilePinView: React.FC<{ item: FileItem }> = ({ item }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
      <div className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground">{item.mime}</div>
      <div className="text-sm font-medium text-foreground line-clamp-2 text-center">{item.name}</div>
    </div>
  );
};

const LinkPinView: React.FC<{ item: LinkItem }> = ({ item }) => {
  return (
    <a href={item.url} target="_blank" rel="noreferrer" className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 hover-scale">
      {item.thumbnail && (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img src={item.thumbnail} alt={item.title || item.url} loading="lazy" className="w-full h-24 object-cover rounded" />
      )}
      <div className="text-sm font-medium text-foreground line-clamp-2 text-center story-link">{item.title || item.url}</div>
    </a>
  );
};

export const BoardCanvas: React.FC = () => {
  const { state, dispatch } = useBoards();
  const board = useMemo(() => state.boards.find((b) => b.id === state.activeBoardId), [state]);
  const [adding, setAdding] = useState<null | "note" | "image" | "file" | "link">(null);

  if (!board) return null;

  const bgUrl = board.texture === "cork" ? cork : board.texture === "wood" ? wood : linen;

  const visibleItems = state.filterTagIds.length
    ? board.items.filter((i) => i.tags.some((t) => state.filterTagIds.includes(t)))
    : board.items;

  const handleChange = (id: string, patch: Partial<BoardItem>) =>
    dispatch({ type: "UPDATE_ITEM", boardId: board.id, itemId: id, patch });
  const handleDelete = (id: string) => dispatch({ type: "DELETE_ITEM", boardId: board.id, itemId: id });

  return (
    <main
      className={cn("relative w-full h-screen")}
      style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: "512px 512px" }}
    >
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 backdrop-blur border border-border shadow-sm">
        <TagIcon className="size-4 opacity-70" />
        {state.tags.map((t) => {
          const active = state.filterTagIds.includes(t.id);
          return (
            <button
              key={t.id}
              aria-pressed={active}
              onClick={() => {
                const tagIds = active
                  ? state.filterTagIds.filter((id) => id !== t.id)
                  : [...state.filterTagIds, t.id];
                dispatch({ type: "SET_FILTERS", tagIds });
              }}
              className={cn(
                "px-3 py-1 rounded-full text-xs border",
                active ? "bg-accent text-accent-foreground border-border" : "bg-background text-foreground border-border"
              )}
              style={{ backgroundColor: active ? undefined : undefined }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Items layer */}
      <div className="absolute inset-0">
        {visibleItems.map((item) => (
          <ItemShell
            key={item.id}
            item={item}
            onChange={(patch) => handleChange(item.id, patch)}
            onDelete={() => handleDelete(item.id)}
          >
            {item.type === "note" && <StickyNoteView item={item as NoteItem} onChange={(p) => handleChange(item.id, p)} />}
            {item.type === "image" && <ImagePinView item={item as ImageItem} />}
            {item.type === "file" && <FilePinView item={item as FileItem} />}
            {item.type === "link" && <LinkPinView item={item as LinkItem} />}
          </ItemShell>
        ))}
      </div>

      {/* Add panels (quick minimal UI) */}
      {adding === "note" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur border border-border shadow p-3 rounded-md flex items-center gap-2 animate-enter">
          <Button size="sm" variant="secondary" onClick={() => setAdding(null)}>Cancel</Button>
          <Button size="sm" variant="hero" onClick={() => setAdding(null)}>Done</Button>
        </div>
      )}
    </main>
  );
};

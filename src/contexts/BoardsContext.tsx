import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { nanoid } from "nanoid";

// Types
export type PinStyle = "pin" | "tape" | "clip";
export type Texture = "cork" | "wood" | "linen";
export type TagId = string;

export type ItemBase = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  color?: string; // hsl string (e.g., `hsl(var(--note-yellow))`)
  pinStyle: PinStyle;
  tags: TagId[];
  createdAt: number;
  updatedAt: number;
};

export type NoteItem = ItemBase & {
  type: "note";
  text: string;
};

export type ImageItem = ItemBase & {
  type: "image";
  src: string; // object URL or remote URL
  name?: string;
  alt?: string;
};

export type FileItem = ItemBase & {
  type: "file";
  name: string;
  url?: string; // object URL
  mime: string;
};

export type LinkItem = ItemBase & {
  type: "link";
  url: string;
  title?: string;
  thumbnail?: string;
};

export type BoardItem = NoteItem | ImageItem | FileItem | LinkItem;

export type Tag = {
  id: TagId;
  label: string;
  color: string; // hsl string
};

export type Board = {
  id: string;
  name: string;
  texture: Texture;
  items: BoardItem[];
};

export type BoardsState = {
  boards: Board[];
  activeBoardId: string;
  tags: Tag[];
  filterTagIds: TagId[];
};

const STORAGE_KEY = "canvas.boards.v1";

// Reducer

type Action =
  | { type: "ADD_BOARD"; name?: string; texture?: Texture }
  | { type: "RENAME_BOARD"; id: string; name: string }
  | { type: "UPDATE_BOARD"; id: string; patch: Partial<Board> }
  | { type: "SET_ACTIVE"; id: string }
  | { type: "DELETE_BOARD"; id: string }
  | { type: "ADD_ITEM"; boardId: string; item: BoardItem }
  | { type: "UPDATE_ITEM"; boardId: string; itemId: string; patch: Partial<BoardItem> }
  | { type: "DELETE_ITEM"; boardId: string; itemId: string }
  | { type: "SET_FILTERS"; tagIds: TagId[] }
  | { type: "LOAD"; state: BoardsState };

function createInitialState(): BoardsState {
  const now = Date.now();
  const defaultBoard: Board = {
    id: nanoid(8),
    name: "My Board",
    texture: "cork",
    items: [
      {
        id: nanoid(8),
        type: "note",
        text: "Double-click to edit me! 📝",
        x: 120,
        y: 120,
        width: 220,
        height: 140,
        rotation: -2,
        color: "hsl(var(--note-yellow))",
        pinStyle: "pin",
        tags: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
  };

  const tags: Tag[] = [
    { id: "school", label: "School", color: "hsl(var(--note-blue))" },
    { id: "personal", label: "Personal", color: "hsl(var(--note-pink))" },
    { id: "ideas", label: "Ideas", color: "hsl(var(--note-green))" },
  ];

  return {
    boards: [defaultBoard],
    activeBoardId: defaultBoard.id,
    tags,
    filterTagIds: [],
  };
}

function reducer(state: BoardsState, action: Action): BoardsState {
  switch (action.type) {
    case "LOAD":
      return action.state;
    case "ADD_BOARD": {
      const board: Board = {
        id: nanoid(8),
        name: action.name || "New Board",
        texture: action.texture || "linen",
        items: [],
      };
      return { ...state, boards: [board, ...state.boards], activeBoardId: board.id };
    }
    case "RENAME_BOARD":
      return {
        ...state,
        boards: state.boards.map((b) => (b.id === action.id ? { ...b, name: action.name } : b)),
      };
    case "UPDATE_BOARD":
      return {
        ...state,
        boards: state.boards.map((b) => (b.id === action.id ? { ...b, ...action.patch } : b)),
      };
    case "SET_ACTIVE":
      return { ...state, activeBoardId: action.id };
    case "DELETE_BOARD": {
      const boards = state.boards.filter((b) => b.id !== action.id);
      const activeBoardId = boards[0]?.id || "";
      return { ...state, boards, activeBoardId };
    }
    case "ADD_ITEM":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId ? { ...b, items: [...b.items, action.item] } : b
        ),
      };
    case "UPDATE_ITEM":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                items: b.items.map((it) =>
                  it.id === action.itemId
                    ? ({ ...it, ...action.patch, updatedAt: Date.now() } as BoardItem)
                    : it
                ),
              }
            : b
        ),
      };
    case "DELETE_ITEM":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId ? { ...b, items: b.items.filter((i) => i.id !== action.itemId) } : b
        ),
      };
    case "SET_FILTERS":
      return { ...state, filterTagIds: action.tagIds };
    default:
      return state;
  }
}

const BoardsContext = createContext<{
  state: BoardsState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const BoardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined as any, createInitialState);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BoardsState;
        dispatch({ type: "LOAD", state: parsed });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <BoardsContext.Provider value={value}>{children}</BoardsContext.Provider>;
};

export function useBoards() {
  const ctx = useContext(BoardsContext);
  if (!ctx) throw new Error("useBoards must be used within BoardsProvider");
  return ctx;
}

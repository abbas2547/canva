// types/editor.ts

import * as fabric from "fabric";

export type ElementType =
  | "text"
  | "image"
  | "shape"
  | "sticker"
  | "path"
  | "frame";

export type ShapeType =
  | "rect"
  | "circle"
  | "triangle"
  | "star"
  | "line"
  | "arrow"
  | "polygon"
  | "heart";

export type EditorTool =
  | "select"
  | "text"
  | "shape"
  | "image"
  | "draw"
  | "crop"
  | "erase";

export type SidebarTab =
  | "design"
  | "templates"
  | "filters"
  | "layers"
  | "stickers"
  | "branding";

export interface CanvasPage {
  id: string;
  name: string;
  jsonState: any;
}

export interface CanvasPreset {
  name: string;
  width: number;
  height: number;
  icon: string;
}

export interface LayerItem {
  id: string;
  name: string;
  type: ElementType;
  visible: boolean;
  locked: boolean;
}

export interface ElementProperties {
  fill: string;
  stroke: string;
  strokeWidth: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  underline: boolean;
  textAlign: string;
  opacity: number;
  lineHeight: number;
  charSpacing: number;
}

export interface EditorState {

  // FABRIC
  canvas: fabric.Canvas | null;

  // PAGES
  pages: CanvasPage[];
  currentPageId: string;

  // SELECTION
  selectedElementId: string | null;

  // UI
  activeTool: EditorTool;
  sidebarTab: SidebarTab;

  // ELEMENTS
  activeProperties: ElementProperties;
  layers: LayerItem[];

  // VIEWPORT
  zoom: number;

  // HISTORY
  history: any[];
  historyIndex: number;

  // AUTOSAVE
  isAutoSaving: boolean;

  // DRAGGING
  isDragging: boolean;

  // CLIPBOARD
  clipboard: fabric.Object | null;

  // ACTIONS
  setCanvas: (
    canvas: fabric.Canvas | null
  ) => void;

  updateActiveProperties: (
    props: Partial<ElementProperties>
  ) => void;

  setSelectedElementId: (
    id: string | null
  ) => void;

  setActiveTool: (
    tool: EditorTool
  ) => void;

  setSidebarTab: (
    tab: SidebarTab
  ) => void;

  setLayers: (
    layers: LayerItem[]
  ) => void;

  setClipboard: (
    clipboard: fabric.Object | null
  ) => void;

  setDragging: (
    dragging: boolean
  ) => void;

  saveHistory: () => void;

  undo: () => Promise<void>;

  redo: () => Promise<void>;

  setZoom: (
    zoom: number
  ) => void;

  changePresetSize: (
    width: number,
    height: number
  ) => void;
}

// FABRIC OBJECT EXTENSION
export interface FabricObjectWithData
  extends fabric.Object {

  id?: string;

  name?: string;

  locked?: boolean;

  selectable: boolean;

  data?: {
    id?: string;
    type?: ElementType;
    name?: string;
    locked?: boolean;
    visible?: boolean;
    [key: string]: any;
  };
}

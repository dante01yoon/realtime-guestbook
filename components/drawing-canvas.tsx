"use client";

import { clsx } from "clsx";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent
} from "react";

export type DrawingCanvasHandle = {
  toBlob: () => Promise<Blob | null>;
  clear: () => void;
  toDataUrl: () => string | null;
};

export interface DrawingCanvasProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  background?: string;
  onDirtyChange?: (dirty: boolean) => void;
  onImageChange?: (dataUrl: string | null) => void;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  (
    {
      width = 600,
      height = 400,
      strokeColor = "#111827",
      strokeWidth = 6,
      background = "#fff",
      onDirtyChange,
      onImageChange
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawing = useRef(false);
    const [mode, setMode] = useState<"draw" | "erase">("draw");
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      onImageChange?.(null);
    }, [background, width, height, onImageChange]);

    useEffect(() => {
      onDirtyChange?.(dirty);
    }, [dirty, onDirtyChange]);

    function startDraw(event: ReactPointerEvent<HTMLCanvasElement>) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      drawing.current = true;
      canvas.setPointerCapture(event.pointerId);
      context.beginPath();
      const rect = canvas.getBoundingClientRect();
      context.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    }

    function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = strokeWidth;
      if (mode === "erase") {
        context.globalCompositeOperation = "destination-out";
        context.lineWidth = strokeWidth * 2;
      } else {
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = strokeColor;
      }

      context.lineTo(x, y);
      context.stroke();
      setDirty(true);
    }

    function endDraw(event: ReactPointerEvent<HTMLCanvasElement>) {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      drawing.current = false;
      canvas.releasePointerCapture(event.pointerId);
      if (dirty) {
        onImageChange?.(canvas.toDataURL("image/png"));
      }
    }

    function clearCanvas() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.globalCompositeOperation = "source-over";
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      setDirty(false);
      onImageChange?.(null);
    }

    useImperativeHandle(ref, () => ({
      toBlob: () =>
        new Promise<Blob | null>((resolve) => {
          const canvas = canvasRef.current;
          if (!canvas) {
            resolve(null);
            return;
          }
          canvas.toBlob((blob) => resolve(blob), "image/png", 1);
        }),
      clear: () => clearCanvas(),
      toDataUrl: () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.toDataURL("image/png");
      }
    }));

    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="그리기 모드"
            onClick={() => setMode("draw")}
            className={clsx(
              "rounded-md px-3 py-1 text-sm font-medium shadow",
              mode === "draw" ? "bg-blue-500 text-white" : "bg-white"
            )}
          >
            펜
          </button>
          <button
            type="button"
            aria-label="지우개 모드"
            onClick={() => setMode("erase")}
            className={clsx(
              "rounded-md px-3 py-1 text-sm font-medium shadow",
              mode === "erase" ? "bg-blue-500 text-white" : "bg-white"
            )}
          >
            지우개
          </button>
          <button
            type="button"
            aria-label="전체 지우기"
            onClick={clearCanvas}
            className="rounded-md bg-rose-500 px-3 py-1 text-sm font-medium text-white shadow"
          >
            모두 지우기
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          aria-label="드로잉 캔버스"
          className="h-auto w-full max-w-2xl cursor-crosshair rounded-xl border border-slate-300 bg-white shadow-inner"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
      </div>
    );
  }
);

DrawingCanvas.displayName = "DrawingCanvas";

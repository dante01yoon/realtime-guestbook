"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export type CanvasBoardHandle = HTMLCanvasElement;

type Tool = "pen" | "eraser";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

interface CanvasBoardProps {
  onChange?: () => void;
}

export const CanvasBoard = forwardRef<CanvasBoardHandle, CanvasBoardProps>(
  ({ onChange }, forwardedRef) => {
    const innerRef = useRef<HTMLCanvasElement | null>(null);
    const setRefs = (node: HTMLCanvasElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLCanvasElement | null>).current = node;
      }
    };

    const [tool, setTool] = useState<Tool>("pen");
    const [isDrawing, setIsDrawing] = useState(false);
    const [lineWidth, setLineWidth] = useState(4);

    useEffect(() => {
      const canvas = innerRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    const getPoint = (event: MouseEvent | TouchEvent) => {
      const canvas = innerRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if (event instanceof TouchEvent) {
        const touch = event.touches[0] ?? event.changedTouches[0];
        if (!touch) return null;
        return {
          x: ((touch.clientX - rect.left) / rect.width) * canvas.width,
          y: ((touch.clientY - rect.top) / rect.height) * canvas.height
        };
      }
      return {
        x: ((event.clientX - rect.left) / rect.width) * canvas.width,
        y: ((event.clientY - rect.top) / rect.height) * canvas.height
      };
    };

    const startDrawing = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      const canvas = innerRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const point = getPoint(event);
      if (!point) return;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      setIsDrawing(true);
    };

    const draw = (event: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      event.preventDefault();
      const canvas = innerRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const point = getPoint(event);
      if (!point) return;
      ctx.strokeStyle = tool === "pen" ? "#1e293b" : "#ffffff";
      ctx.lineWidth = tool === "pen" ? lineWidth : 20;
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      onChange?.();
    };

    const endDrawing = (event: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      event.preventDefault();
      const canvas = innerRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.closePath();
      setIsDrawing(false);
    };

    const handleClear = () => {
      const canvas = innerRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      onChange?.();
    };

    const handleLineWidthChange = (delta: number) => {
      setLineWidth((prev) => Math.min(12, Math.max(2, prev + delta)));
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="드로잉 도구">
          <Button
            type="button"
            variant={tool === "pen" ? "primary" : "secondary"}
            onClick={() => setTool("pen")}
            aria-pressed={tool === "pen"}
          >
            펜
          </Button>
          <Button
            type="button"
            variant={tool === "eraser" ? "primary" : "secondary"}
            onClick={() => setTool("eraser")}
            aria-pressed={tool === "eraser"}
          >
            지우개
          </Button>
          <Button type="button" variant="ghost" onClick={() => handleLineWidthChange(1)}>
            굵게 +
          </Button>
          <Button type="button" variant="ghost" onClick={() => handleLineWidthChange(-1)}>
            굵게 -
          </Button>
          <Button type="button" variant="ghost" onClick={handleClear}>
            전체 지우기
          </Button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner">
          <canvas
            ref={setRefs}
            className="h-[300px] w-full touch-none"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            role="img"
            aria-label="방명록 드로잉 캔버스"
            onMouseDown={startDrawing as unknown as React.MouseEventHandler<HTMLCanvasElement>}
            onMouseMove={draw as unknown as React.MouseEventHandler<HTMLCanvasElement>}
            onMouseUp={endDrawing as unknown as React.MouseEventHandler<HTMLCanvasElement>}
            onMouseLeave={endDrawing as unknown as React.MouseEventHandler<HTMLCanvasElement>}
            onTouchStart={startDrawing as unknown as React.TouchEventHandler<HTMLCanvasElement>}
            onTouchMove={draw as unknown as React.TouchEventHandler<HTMLCanvasElement>}
            onTouchEnd={endDrawing as unknown as React.TouchEventHandler<HTMLCanvasElement>}
          />
        </div>
      </div>
    );
  }
);

CanvasBoard.displayName = "CanvasBoard";

export async function exportCanvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("이미지 생성에 실패했습니다."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

"use client";

import { Rnd } from "react-rnd";

interface SignatureOverlayProps {
  signatureDataUrl: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  selected: boolean;
  onUpdate: (
    pos: { x: number; y: number },
    size: { width: number; height: number }
  ) => void;
  onRotate: (rotation: number) => void;
  onSelect: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

export default function SignatureOverlay({
  signatureDataUrl,
  position,
  size,
  rotation,
  selected,
  onUpdate,
  onRotate,
  onSelect,
  onCopy,
  onDelete,
}: SignatureOverlayProps) {
  const borderColor = selected ? "#3b82f6" : "#94a3b8";
  const bgColor = selected ? "rgba(59, 130, 246, 0.05)" : "rgba(0, 0, 0, 0.02)";

  return (
    <Rnd
      bounds="parent"
      size={size}
      position={position}
      onDragStart={onSelect}
      onDragStop={(_e, d) => onUpdate({ x: d.x, y: d.y }, size)}
      onResizeStart={onSelect}
      onResizeStop={(_e, _direction, ref, _delta, pos) => {
        onUpdate(pos, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
      }}
      lockAspectRatio={true}
      minWidth={50}
      minHeight={20}
      style={{
        border: `2px dashed ${borderColor}`,
        borderRadius: "4px",
        zIndex: selected ? 20 : 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bgColor,
      }}
    >
      {/* Click area to select */}
      <div
        style={{ width: "100%", height: "100%", cursor: "move" }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <img
          src={signatureDataUrl}
          alt="Signature overlay"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
            padding: "2px",
            transform: `rotate(${rotation}deg)`,
          }}
          draggable={false}
        />
      </div>

      {/* Controls - only show when selected */}
      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: "-36px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "4px",
            pointerEvents: "auto",
          }}
        >
          {/* Rotate left */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRotate(rotation - 90);
            }}
            style={btnStyle}
            title="逆时针旋转90°"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 2v6h6" />
              <path d="M2.5 8C5.5 3 11 1.5 16 4s7.5 8 5.5 13-8 7.5-13 5.5" />
            </svg>
          </button>
          {/* Rotate right */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRotate(rotation + 90);
            }}
            style={btnStyle}
            title="顺时针旋转90°"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6" />
              <path d="M21.5 8C18.5 3 13 1.5 8 4S.5 12 2.5 17s8 7.5 13 5.5" />
            </svg>
          </button>
          {/* Copy */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            style={btnStyle}
            title="复制签名"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
          {/* Delete */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{ ...btnStyle, color: "#ef4444" }}
            title="删除签名"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      )}
    </Rnd>
  );
}

const btnStyle: React.CSSProperties = {
  width: "28px",
  height: "28px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  color: "#374151",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

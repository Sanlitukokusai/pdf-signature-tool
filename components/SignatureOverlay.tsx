"use client";

import { Rnd } from "react-rnd";

interface SignatureOverlayProps {
  signatureDataUrl: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  onUpdate: (
    pos: { x: number; y: number },
    size: { width: number; height: number }
  ) => void;
  onRotate: (rotation: number) => void;
}

export default function SignatureOverlay({
  signatureDataUrl,
  position,
  size,
  rotation,
  onUpdate,
  onRotate,
}: SignatureOverlayProps) {
  return (
    <Rnd
      bounds="parent"
      size={size}
      position={position}
      onDragStop={(_e, d) => onUpdate({ x: d.x, y: d.y }, size)}
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
        border: "2px dashed #3b82f6",
        borderRadius: "4px",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(59, 130, 246, 0.05)",
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

      {/* Rotation controls */}
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
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRotate(rotation - 90);
          }}
          style={{
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
          }}
          title="逆时针旋转90°"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 2v6h6" />
            <path d="M2.5 8C5.5 3 11 1.5 16 4s7.5 8 5.5 13-8 7.5-13 5.5" />
          </svg>
        </button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRotate(rotation + 90);
          }}
          style={{
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
          }}
          title="顺时针旋转90°"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6" />
            <path d="M21.5 8C18.5 3 13 1.5 8 4S.5 12 2.5 17s8 7.5 13 5.5" />
          </svg>
        </button>
      </div>
    </Rnd>
  );
}

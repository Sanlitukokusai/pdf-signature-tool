"use client";

import { Rnd } from "react-rnd";

interface DateStampOverlayProps {
  dateText: string;
  fontSize: number;
  position: { x: number; y: number };
  selected: boolean;
  onUpdate: (pos: { x: number; y: number }) => void;
  onSelect: () => void;
  onDelete: () => void;
  onFontSizeChange: (fontSize: number) => void;
  onDateTextChange: (dateText: string) => void;
}

export default function DateStampOverlay({
  dateText,
  fontSize,
  position,
  selected,
  onUpdate,
  onSelect,
  onDelete,
  onFontSizeChange,
  onDateTextChange,
}: DateStampOverlayProps) {
  const borderColor = selected ? "#8b5cf6" : "rgba(139, 92, 246, 0.3)";
  const bgColor = selected ? "rgba(139, 92, 246, 0.08)" : "rgba(139, 92, 246, 0.04)";

  return (
    <Rnd
      bounds="parent"
      position={position}
      size={{ width: "auto" as unknown as number, height: "auto" as unknown as number }}
      enableResizing={false}
      onDragStart={onSelect}
      onDragStop={(_e, d) => onUpdate({ x: d.x, y: d.y })}
      style={{
        border: `2px dashed ${borderColor}`,
        borderRadius: "4px",
        zIndex: selected ? 20 : 10,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: bgColor,
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          cursor: "move",
          padding: "2px 6px",
          userSelect: "none",
          fontSize: `${fontSize}px`,
          fontFamily: "serif",
          color: "#000",
          lineHeight: 1.2,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {dateText}
      </div>

      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "4px",
            alignItems: "center",
            pointerEvents: "auto",
          }}
        >
          {/* Font size decrease */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onFontSizeChange(Math.max(8, fontSize - 2));
            }}
            style={btnStyle}
            title="减小字号"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          {/* Font size display */}
          <span style={{ fontSize: "11px", color: "#6b7280", minWidth: "20px", textAlign: "center" }}>
            {fontSize}
          </span>
          {/* Font size increase */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onFontSizeChange(Math.min(48, fontSize + 2));
            }}
            style={btnStyle}
            title="增大字号"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          {/* Date input */}
          <input
            type="date"
            value={dateText}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              onDateTextChange(e.target.value);
            }}
            style={{
              ...btnStyle,
              width: "auto",
              padding: "0 4px",
              fontSize: "11px",
              cursor: "pointer",
            }}
          />
          {/* Delete */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{ ...btnStyle, color: "#ef4444" }}
            title="删除日期"
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

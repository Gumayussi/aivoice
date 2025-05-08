import React from "react";

export interface TranscriptionViewProps {
  /**
   * 实时转录内容
   */
  transcript?: string;
}

/**
 * 实时转录视图组件（不保留历史，仅展示当前）
 */
export default function TranscriptionView({ transcript }: TranscriptionViewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="relative h-[200px] w-[512px] max-w-[90vw] mx-auto">
      {/* 渐变遮罩 */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[var(--lk-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--lk-bg)] to-transparent z-10 pointer-events-none" />

      {/* 实时转录显示区域 */}
      <div
        ref={containerRef}
        className="h-full flex flex-col justify-end overflow-y-auto px-4 py-8"
      >
        {transcript?.trim() && (
          <div className="bg-gray-800 rounded-md p-2 self-end">
            {transcript}
          </div>
        )}
      </div>
    </div>
  );
}
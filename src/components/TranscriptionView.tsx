// src/components/TranscriptionView.tsx
import React from "react";
import useCombinedTranscriptions from "@/hooks/useCombinedTranscriptions";

export interface TranscriptionViewProps {
    /**
     * 来自 Deepgram 或后端的实时转录文案，可选
     */
    transcript?: string;
}

/**
 * 实时转录视图组件，结合历史转录和当前实时文本
 */
export default function TranscriptionView({ transcript }: TranscriptionViewProps) {
    const combinedTranscriptions = useCombinedTranscriptions();
    const containerRef = React.useRef<HTMLDivElement>(null);

    // 构建展示列表：历史 + 实时
    const segments = React.useMemo(() => {
        const MAX_SEGMENTS = 200;
        const segs = [...combinedTranscriptions];
        if (transcript && transcript.trim().length > 0) {
            segs.push({
                id: `live-${Date.now()}`,
                role: "user",
                text: transcript,
            });
        }
        return segs.slice(-MAX_SEGMENTS);
    }, [combinedTranscriptions, transcript]);

    // // 内容更新时滚动到底部
    // React.useEffect(() => {
    //     if (containerRef.current) {
    //         containerRef.current.scrollTop = containerRef.current.scrollHeight;
    //     }
    // }, [segments]);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
        }, 50);
        return () => clearTimeout(timeout);
    }, [segments]);

    return (
        <div className="relative h-[200px] w-[512px] max-w-[90vw] mx-auto">
            {/* 顶部和底部渐变遮罩 */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[var(--lk-bg)] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--lk-bg)] to-transparent z-10 pointer-events-none" />

            {/* 滚动区域 */}
            <div ref={containerRef} className="h-full flex flex-col gap-2 overflow-y-auto px-4 py-8">
                {segments.map((segment) => (
                    <div
                        id={segment.id}
                        key={segment.id}
                        className={
                            segment.role === "assistant"
                                ? "p-2 self-start"
                                : "bg-gray-800 rounded-md p-2 self-end"
                        }
                    >
                        {segment.text}
                    </div>
                ))}
            </div>
        </div>
    );
}

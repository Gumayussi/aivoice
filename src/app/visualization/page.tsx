"use client";

import { CloseIcon } from "@/components/CloseIcon";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import { LiveKitRoom } from '@livekit/components-react';
import {
    BarVisualizer,
    DisconnectButton,
    // RoomContext,
    VideoTrack,
    VoiceAssistantControlBar,
    useVoiceAssistant, RoomAudioRenderer,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
// import { Room, RoomEvent } from "livekit-client";
import { useState } from "react";
// import type { ConnectionDetails } from "@/app/api/get-token/route";

export default function Page() {
    const [roomName, setRoomName] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [serverUrl, setServerUrl] = useState<string | null>(null);

    const onConnect = async () => {
        const room = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;
        const user = `user_${Math.floor(Math.random() * 10_000)}`;
        const url = new URL(
            process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ??
            `/api/get-token?roomName=${room}&participantName=${user}`,
            window.location.origin
        );
        const res = await fetch(url.toString());
        const { serverUrl, participantToken } = await res.json();
        setRoomName(room);
        setServerUrl(serverUrl);
        setToken(participantToken);
    };


    return (
        <main data-lk-theme="default" className="h-full grid content-center bg-[var(--lk-bg)]">
            {roomName && token && serverUrl ? (
                <LiveKitRoom
                    serverUrl={serverUrl}
                    token={token}
                    connect={true}
                    audio={true}
                    video={false}
                >
                    <div className="lk-room-container max-w-[1024px] w-[90vw] mx-auto max-h-[90vh]">
                        <SimpleVoiceAssistant onConnectButtonClicked={onConnect} />
                        <VoiceAssistantControlBar />
                        <RoomAudioRenderer />
                    </div>
                </LiveKitRoom>
            ) : (
                <div className="grid place-content-center h-full">
                    <button
                        className="uppercase px-4 py-2 bg-white text-black rounded-md"
                        onClick={onConnect}
                    >
                        Start a conversation
                    </button>
                </div>
            )}
        </main>
    );
}

// SimpleVoiceAssistant
function SimpleVoiceAssistant(props: {
    onConnectButtonClicked: () => void;
}) {
    const { state: agentState } = useVoiceAssistant();

    console.log("================ VoiceAssistant State:", agentState + "====================");

    return (
        <AnimatePresence mode="wait">
            {agentState === "disconnected" ? (
                <motion.div
                    key="disconnected"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="grid items-center justify-center h-full"
                >
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="uppercase px-4 py-2 bg-white text-black rounded-md"
                        onClick={props.onConnectButtonClicked}
                    >
                        Start a conversation
                    </motion.button>
                </motion.div>
            ) : (
                <motion.div
                    key="connected"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-4 h-full"
                >
                    <AgentVisualizer />
                    <ControlBar onConnectButtonClicked={props.onConnectButtonClicked} />
                    <NoAgentNotification state={agentState} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function AgentVisualizer() {
    const { state: agentState, videoTrack, audioTrack } = useVoiceAssistant();
    if (videoTrack) {
        return (
            <div className="h-[512px] w-[512px] rounded-lg overflow-hidden">
                <VideoTrack trackRef={videoTrack} />
            </div>
        );
    }
    return (
        <div className="h-[300px] w-full">
            <BarVisualizer
                state={agentState}
                barCount={5}
                trackRef={audioTrack}
                className="agent-visualizer"
                options={{ minHeight: 24 }}
            />
        </div>
    );
}

function ControlBar(props: { onConnectButtonClicked: () => void }) {
    const { state: agentState } = useVoiceAssistant();
    return (
        <div className="relative h-[60px]">
            <AnimatePresence>
                {agentState === "disconnected" && (
                    <motion.button
                        initial={{ opacity: 0, top: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, top: "-10px" }}
                        transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
                        className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md"
                        onClick={props.onConnectButtonClicked}
                    >
                        Start a conversation
                    </motion.button>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {agentState !== "disconnected" && agentState !== "connecting" && (
                    <motion.div
                        initial={{ opacity: 0, top: "10px" }}
                        animate={{ opacity: 1, top: 0 }}
                        exit={{ opacity: 0, top: "-10px" }}
                        transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
                        className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center"
                    >
                        <VoiceAssistantControlBar controls={{ leave: false }} />
                        <DisconnectButton>
                            <CloseIcon />
                        </DisconnectButton>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// function onDeviceFailure(error: Error) {
//     console.error(error);
//     alert(
//         "Error acquiring camera or microphone permissions. Please grant permissions and reload."
//     );
// }

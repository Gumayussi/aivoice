"use client";

import {CloseIcon} from "@/components/CloseIcon";
import {NoAgentNotification} from "@/components/NoAgentNotification";
import TranscriptionView from "@/components/TranscriptionView";
import {
    BarVisualizer,
    DisconnectButton,
    RoomAudioRenderer,
    RoomContext,
    VideoTrack,
    VoiceAssistantControlBar,
    useVoiceAssistant,
} from "@livekit/components-react";
import {AnimatePresence, motion} from "framer-motion";
import {Room, RoomEvent} from "livekit-client";
import {useCallback, useEffect, useRef, useState} from "react";
import type {ConnectionDetails} from "@/app/api/get-token/route";

export default function Page() {
    const [room] = useState(new Room());
    const [roomName] = useState(`voice_assistant_room_${Math.floor(Math.random() * 10_000)}`);
    const [userName] = useState(`user_${Math.floor(Math.random() * 10_000)}`);

    const [invited, setInvited] = useState(false);
    const [code, setCode] = useState("");
    const inputRef = useRef<HTMLDivElement>(null);


    const onConnectButtonClicked = useCallback(async () => {
        // const url = new URL(
        //     process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? `/api/get-token?roomName=${roomName}&participantName=${userName}`,
        //     window.location.origin
        // );
        const url = new URL(
            `/api/get-token?roomName=${roomName}&participantName=${userName}`,
            window.location.origin
        );
        const response = await fetch(url.toString());
        const connectionDetailsData: ConnectionDetails = await response.json();

        console.log("================================")
        console.log(connectionDetailsData);
        await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);
        await room.localParticipant.setMicrophoneEnabled(true);
    }, [room]);

    useEffect(() => {
        room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

        return () => {
            room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
        };
    }, [room]);


    // 自动聚焦
    useEffect(() => {
        inputRef.current?.focus()
    }, []);


    // 聚焦 div 时监听键盘输入
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            setCode((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
            handleSubmit()
        } else if (e.key.length === 1 && code.length < MAX_LENGTH) {
            setCode((prev) => prev + e.key);
        }
    };

    const handleSubmit = () => {
        if (code.trim() === "123456") {
            setInvited(true);
        } else {
            alert("邀请码无效");
        }
    };


    const MAX_LENGTH = 6;
    const chars = Array.from({ length: MAX_LENGTH }, (_, i) => code[i] || '');

    if (!invited) {
        return (
            <div className="flex flex-col md:flex-row h-screen">
                {/* 左侧：主视觉横幅图 + 文案 */}
                <div className="w-full md:w-3/4 h-1/2 md:h-full relative">
                    <img
                        src="/flatmap.png"
                        alt="main"
                        className="w-full h-full object-cover"
                    />
                    {/* 文字叠加在图上 */}
                    <div
                        className="absolute inset-0 bg-opacity-20 bg-black font-mono flex flex-col justify-center items-center text-white text-center px-4"
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4">WELCOME MY FRIEND</h1>
                        <p className="text-base sm:text-lg max-w-xl">
                            I&#39;m here to help, Let&#39;s go for it.
                        </p>
                    </div>
                </div>

                {/* 右侧：输入框区域 */}
                <div className="w-full md:w-1/4 bg-black flex flex-col items-center justify-center py-6">
                    <h2 className="text-lime-50 text-lg font-mono mb-4 tracking-wider">
                        [System] Access Code Required
                    </h2>

                    <div
                        ref={inputRef}
                        tabIndex={-1}
                        onKeyDown={handleKeyDown}
                        className="flex justify-center gap-x-2 w-full max-w-xs px-4 outline-none"
                    >
                        {chars.map((char, i) => (
                            <div
                                key={i}
                                className="w-8 h-10 flex items-center justify-center border-b-2 border-lime-50 font-mono text-white text-xl"
                            >
                                {char}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <main data-lk-theme="default" className="h-full grid content-center bg-[var(--lk-bg)]">
            <RoomContext.Provider value={room}>
                <div className="lk-room-container max-w-[1024px] w-[90vw] mx-auto max-h-[90vh]">
                    <SimpleVoiceAssistant onConnectButtonClicked={onConnectButtonClicked}/>
                </div>
            </RoomContext.Provider>
        </main>
    );
}

function SimpleVoiceAssistant(props: { onConnectButtonClicked: () => void }) {
    const {state: agentState} = useVoiceAssistant();

    return (
        <>
            <AnimatePresence mode="wait">
                {agentState === "disconnected" ? (
                    <motion.div
                        key="disconnected"
                        initial={{opacity: 0, scale: 0.95}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.95}}
                        transition={{duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055]}}
                        className="grid items-center justify-center h-full"
                    >
                        <motion.button
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{duration: 0.3, delay: 0.1}}
                            className="uppercase px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-md hover:shadow-lg transition-all"
                            onClick={() => props.onConnectButtonClicked()}
                        >
                            Start a conversation
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="connected"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055]}}
                        className="flex flex-col items-center gap-4 h-full"
                    >
                        <AgentVisualizer/>
                        <div className="flex-1 w-full">
                            <TranscriptionView/>
                        </div>
                        <div className="w-full">
                            <ControlBar onConnectButtonClicked={props.onConnectButtonClicked}/>
                        </div>
                        <RoomAudioRenderer/>
                        <NoAgentNotification state={agentState}/>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function AgentVisualizer() {
    const {state: agentState, videoTrack, audioTrack} = useVoiceAssistant();

    if (videoTrack) {
        return (
            <div className="h-[512px] w-[512px] rounded-lg overflow-hidden">
                <VideoTrack trackRef={videoTrack}/>
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
                options={{minHeight: 24}}
            />
        </div>
    );
}

function ControlBar(props: { onConnectButtonClicked: () => void }) {
    const {state: agentState} = useVoiceAssistant();

    return (
        <div className="relative h-[60px]">
            <AnimatePresence>
                {agentState === "disconnected" && (
                    <motion.button
                        initial={{opacity: 0, top: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0, top: "-10px"}}
                        transition={{duration: 1, ease: [0.09, 1.04, 0.245, 1.055]}}
                        className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md"
                        onClick={() => props.onConnectButtonClicked()}
                    >
                        Start a conversation
                    </motion.button>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {agentState !== "disconnected" && agentState !== "connecting" && (
                    <motion.div
                        initial={{opacity: 0, top: "10px"}}
                        animate={{opacity: 1, top: 0}}
                        exit={{opacity: 0, top: "-10px"}}
                        transition={{duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055]}}
                        className="flex h-8 absolute left-1/2 -translate-x-1/2  justify-center"
                    >
                        <VoiceAssistantControlBar controls={{leave: false}}/>
                        <DisconnectButton>
                            <CloseIcon/>
                        </DisconnectButton>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function onDeviceFailure(error: Error) {
    console.error(error);
    alert(
        "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
    );
}

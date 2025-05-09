"use client"

import {useState} from "react";

export default function Page() {
    const [code, setCode] = useState("");

    const handleSubmit = async () => {
        if (!code.trim()) return;

        const res = await fetch('/api/insert-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        const result = await res.json();
        if (result.success) {
            alert('邀请码提交成功！');
            setCode('');
        } else {
            alert(`提交失败: ${result.message}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="p-10">
            <h1 className="mb-4 text-xl font-semibold">请输入邀请码</h1>
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border border-gray-400 px-4 py-2 rounded w-full max-w-sm"
            />
        </div>
    );
}
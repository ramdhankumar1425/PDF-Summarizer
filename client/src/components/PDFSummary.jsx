import React, { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import Markdown from "react-markdown";
import axios from "axios";

const PDFSummary = () => {
    const [file, setFile] = useState(null);
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [error, setError] = useState("");

    const animationProps = useSpring({
        opacity: showSummary ? 1 : 0,
        transform: showSummary ? "translateY(0)" : "translateY(-20px)",
        config: { duration: 500 },
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            const MAX_FILE_SIZE = 10 * 1024 * 1024;

            if (selectedFile.size > MAX_FILE_SIZE) {
                setError("File size exceeds the 10MB limit.");
                return;
            }

            setFile(selectedFile);
            setShowSummary(false);
            setSummary("");
        }
    };

    const handleGetSummary = async () => {
        if (!file) return;

        setError("");
        setLoading(true);
        setShowSummary(false);
        setSummary("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_URI}/api/summary`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const { msg, summary } = response.data;

            console.log(msg, "\n", summary);

            setSummary(summary);
            setShowSummary(true);
            setLoading(false);
        } catch (err) {
            if (err.response) {
                setError(err.response.data.msg);
                console.error("Error:", err.response.data);
            }

            console.error("Error:", err.message);
            setLoading(false);
            setShowSummary(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                {/* Heading */}
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
                    PDF Summary Generator
                </h1>
                {/* File Input */}
                <div className="relative mb-6">
                    <label
                        htmlFor="fileInput"
                        className={`block w-full py-3 px-5 text-gray-700 bg-gray-200 border border-gray-300 rounded-lg text-center ${
                            loading
                                ? "cursor-not-allowed"
                                : "cursor-pointer hover:bg-gray-300"
                        } focus:ring-2 focus:ring-gray-400 focus:outline-none`}
                    >
                        {file ? file.name : "Upload PDF (Max. 10MB)"}
                    </label>
                    <input
                        id="fileInput"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={loading}
                        className="hidden"
                    />
                </div>
                {/* Selected file name */}
                {file && (
                    <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <p className="text-sm text-gray-600">
                            Selected File:{" "}
                            <span className="font-medium">{file.name}</span>
                        </p>
                    </div>
                )}
                {/* Generate Button */}
                <button
                    onClick={handleGetSummary}
                    disabled={!file || loading}
                    className={`w-full py-3 px-5 rounded-lg focus:outline-none transition-all ${
                        loading || !file
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    {loading ? "Analyzing..." : "Generate Summary"}
                </button>
                {/* Summary */}
                {summary && (
                    <animated.div
                        style={animationProps}
                        className="mt-6 p-5 bg-gray-100 border border-gray-300 rounded-lg"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Summary
                            </h2>
                            <button
                                onClick={() =>
                                    navigator.clipboard.writeText(summary)
                                }
                                className="w-7 p-1.5 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                                title="Copy Summary"
                            >
                                <img src="/copy-icon.svg" alt="Copy icon" />
                            </button>
                        </div>
                        {/* <p className="text-gray-700">{summary}</p> */}
                        <Summary summary={summary} />
                    </animated.div>
                )}
            </div>
            <ErrorMessage error={error} setError={setError} />
        </div>
    );
};

export default PDFSummary;

function Summary({ summary }) {
    return (
        <Markdown
            children={summary}
            components={{
                strong({ children }) {
                    return (
                        <h1 className="text-2xl font-semibold py-2">
                            {children}
                        </h1>
                    );
                },
                ul({ children }) {
                    return <ul className="list-disc space-y-2">{children}</ul>;
                },
            }}
        />
    );
}

function ErrorMessage({ error, setError }) {
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError("");
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [error, setError]);

    const animation = useSpring({
        transform: error ? "translateX(0%)" : "translateX(110%)",
        opacity: error ? 1 : 0,
        config: { tension: 300, friction: 30 },
    });

    return (
        <animated.div
            style={animation}
            className="fixed right-0 bottom-10 transform  w-11/12 max-w-md mt-6 p-4 bg-red-100 border border-red-300 rounded-lg shadow-lg z-50"
        >
            <h2 className="text-lg font-semibold text-red-800">Error</h2>
            <p className="text-sm text-red-700">{error}</p>
        </animated.div>
    );
}

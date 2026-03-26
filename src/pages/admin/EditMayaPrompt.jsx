import React, { useState, useEffect } from 'react';
import { getMayaPrompt, updateMayaPrompt, getMayaPromptHistory } from '../../api';

const EditMayaPrompt = () => {
    const [prompt, setPrompt] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeView, setActiveView] = useState('editor'); // 'editor' or 'history'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [promptRes, historyRes] = await Promise.all([
                getMayaPrompt(),
                getMayaPromptHistory()
            ]);
            setPrompt(promptRes.data.prompt);
            setHistory(historyRes.data.history || []);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load Maya prompt data' });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await updateMayaPrompt(prompt);
            setMessage({ type: 'success', text: 'Maya prompt updated successfully!' });
            // Refresh history
            const historyRes = await getMayaPromptHistory();
            setHistory(historyRes.data.history || []);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update Maya prompt' });
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading editor...</div>;

    return (
        <div className="bg-slate-900/50 rounded-3xl shadow-sm border border-slate-800/60 overflow-hidden">
            <div className="p-6 border-b border-slate-800/60 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Maya Receptionist Prompt Configuration</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Screens and routes user questions before reaching Guruji
                    </p>
                </div>
                <div className="flex bg-black p-1 rounded-xl">
                    {['editor', 'history'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveView(tab)}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeView === tab
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 space-y-4">
                {message.text && (
                    <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' : 'bg-rose-900/30 text-rose-400 border border-rose-800/50'}`}>
                        {message.text}
                    </div>
                )}

                {activeView === 'editor' ? (
                    <>
                        <textarea
                            className="w-full h-[500px] p-4 font-mono text-sm text-slate-300 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none custom-scrollbar"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter Maya system prompt here..."
                        />

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm tracking-wide rounded-xl transition-all shadow-lg shadow-indigo-900/50 disabled:opacity-50 flex items-center"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : 'Save Configuration'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="h-[550px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800/60 pb-4">
                                    <th className="py-4 px-4 font-black">Date</th>
                                    <th className="py-4 px-4 font-black">Updated By</th>
                                    <th className="py-4 px-4 font-black">Preview</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {history.length > 0 ? history.map((h, i) => (
                                    <tr key={i} className="text-slate-300 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className="font-mono text-xs text-indigo-400">
                                                {new Date(h.updated_at * 1000).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-slate-300 uppercase">
                                                {h.updated_by}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 max-w-xl">
                                            <div className="bg-black p-3 rounded-xl border border-slate-800">
                                                <p className="font-mono text-xs text-slate-500 truncate">
                                                    {h.content.substring(0, 100)}...
                                                </p>
                                                <button
                                                    className="mt-2 text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 tracking-wider"
                                                    onClick={() => {
                                                        setPrompt(h.content);
                                                        setActiveView('editor');
                                                    }}
                                                >
                                                    Restore Version
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="py-12 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                                            No history found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditMayaPrompt;

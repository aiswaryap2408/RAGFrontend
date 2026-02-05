import React, { useState, useEffect } from 'react';
import { getLoginLogs } from '../../api';

const LoginLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        email: '',
        mobile: '',
        date: ''
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async (currentFilters = filters) => {
        setLoading(true);
        try {
            const response = await getLoginLogs(currentFilters);
            setLogs(response.data || response);
        } catch (err) {
            console.error("Failed to fetch logs", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
    };

    const applyFilters = () => {
        fetchLogs(filters);
    };

    const clearFilters = () => {
        const cleared = { name: '', email: '', mobile: '', date: '' };
        setFilters(cleared);
        fetchLogs(cleared);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleString();
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto bg-black animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0">
                <h2 className="text-4xl font-black text-white tracking-tighter">Login Logs</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={applyFilters}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/40"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={clearFilters}
                        className="px-6 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Filters bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800/60 transition-all">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={filters.name}
                        onChange={handleFilterChange}
                        placeholder="Filter by name"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</label>
                    <input
                        type="text"
                        name="email"
                        value={filters.email}
                        onChange={handleFilterChange}
                        placeholder="Filter by email"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</label>
                    <input
                        type="text"
                        name="mobile"
                        value={filters.mobile}
                        onChange={handleFilterChange}
                        placeholder="Filter by phone"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800/60 shadow-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                <th className="px-8 py-5">Date & Time</th>
                                <th className="px-8 py-5">User Details</th>
                                <th className="px-8 py-5">Method</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Network Info</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="w-10 h-10 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
                                            <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Retrieving Audit Trail</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <p className="text-slate-700 font-black uppercase tracking-widest text-xs">No logs found</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, i) => (
                                    <tr key={i} className="hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-white">{formatDate(log.timestamp).split(',')[0]}</p>
                                            <p className="text-[10px] font-bold text-slate-500">{formatDate(log.timestamp).split(',')[1]}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {log.name ? log.name[0].toUpperCase() : (log.mobile ? log.mobile[log.mobile.length - 1] : '?')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-200">{log.name || 'Anonymous'}</p>
                                                    <p className="text-[10px] font-bold text-slate-500">{log.mobile} • {log.email || 'No email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] font-black uppercase tracking-tighter text-slate-400 border border-slate-700">
                                                {log.method.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {log.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[10px] font-mono text-slate-400">{log.ip_address || 'Unknown IP'}</p>
                                            <p className="text-[8px] font-bold text-slate-600 truncate max-w-[150px]" title={log.user_agent}>{log.user_agent}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => window.location.href = `/admin?tab=users&mobile=${log.mobile}`}
                                                className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors group/btn"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">History</span>
                                                <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}</style>
        </div>
    );
};

export default LoginLogs;

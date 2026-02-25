import React, { useState, useEffect } from 'react';
import DashboardOverview from './DashboardOverview';
import SystemPromptEditor from './SystemPromptEditor';
import EditMayaPrompt from './EditMayaPrompt';
import ReportPromptEditor from './ReportPromptEditor';
import LoginLogs from './LoginLogs';
import {
    getAllUsers as getUsers,
    getUserDetails,
    getBalance as getUserWallet,
    getTransactionHistory as getUserTransactions,
    toggleWalletSystem
} from '../../api';

const NavButton = ({ active, onClick, icon, label, themeColor }) => {
    // Explicit color mapping to ensure Tailwind picks up the classes
    const activeClasses = {
        indigo: 'bg-indigo-600 shadow-indigo-900/40',
        rose: 'bg-rose-600 shadow-rose-900/40',
        violet: 'bg-violet-600 shadow-violet-900/40',
        orange: 'bg-orange-600 shadow-orange-900/40',
        emerald: 'bg-emerald-600 shadow-emerald-900/40',
        slate: 'bg-slate-700 shadow-slate-900/40'
    };

    return (
        <button
            onClick={onClick}
            className={`w-full group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${active
                ? `${activeClasses[themeColor] || 'bg-slate-700'} text-white shadow-xl -translate-y-0.5`
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
        >
            <div className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </div>
            <span className="ml-3.5 font-black text-xs uppercase tracking-[0.15em] relative z-10">{label}</span>
            {active && (
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/30 rounded-full my-3 mr-1"></div>
            )}
        </button>
    );
};

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [detailTab, setDetailTab] = useState('history');
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState({ user: null, wallet: null, transactions: [], profile: null });
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [historyDateFilter, setHistoryDateFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [walletEnabled, setWalletEnabled] = useState(true);
    const [paymentEnabled, setPaymentEnabled] = useState(true);
    const [mayaJsonEnabled, setMayaJsonEnabled] = useState(false);
    const [gurujiJsonEnabled, setGurujiJsonEnabled] = useState(false);

    // RAG Tester State
    const [testFile, setTestFile] = useState(null);
    const [testStatus, setTestStatus] = useState("idle");
    const [testDocId, setTestDocId] = useState("");
    const [testInput, setTestInput] = useState("");
    const [testMessages, setTestMessages] = useState([]);
    const [testChatLoading, setTestChatLoading] = useState(false);

    useEffect(() => {
        fetchUsers();

        // Handle URL parameters for navigation
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const mobile = params.get('mobile');

        if (tab) setActiveTab(tab);
        if (mobile) {
            setSelectedUser(mobile);
            handleUserClick(mobile);
        }
    }, []);

    useEffect(() => {
        const filtered = users.filter(user =>
            (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.mobile && user.mobile.includes(searchTerm))
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers();
            const data = response?.data || response;
            const userList = Array.isArray(data) ? data : [];
            setUsers(userList);
            setFilteredUsers(userList);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setUsers([]);
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = async (mobile) => {
        setSelectedUser(mobile);
        setDetailTab('history');
        setDetailsLoading(true);
        setSelectedSessionId(null);
        setHistoryDateFilter('');
        try {
            const [detailsRes, walletRes, transactionsRes] = await Promise.all([
                getUserDetails(mobile),
                getUserWallet(mobile),
                getUserTransactions(mobile)
            ]);

            const details = detailsRes?.data || detailsRes;
            const wallet = walletRes?.data || walletRes;
            const transactions = transactionsRes?.data || transactionsRes;

            // Focus only on chats
            const chats = (details?.chats || []).map(c => ({ ...c, type: 'chat' }));
            const sessions = [...chats].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            setUserDetails({
                user: details?.user || details?.profile || details,
                profile: details?.profile || details?.user || details,
                wallet: wallet,
                transactions: Array.isArray(transactions) ? transactions : [],
                sessions: sessions
            });

            // Auto-select latest session if available
            if (sessions.length > 0) {
                const latest = sessions[0];
                setSelectedSessionId(latest.session_id || 'legacy');
            }
        } catch (err) {
            console.error("Failed to fetch user details", err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleTogglePayment = async () => {
        try {
            const newState = !paymentEnabled;
            setPaymentEnabled(newState);
            import('../../api').then(async (api) => {
                await api.updateSystemSettings('payment_enabled', newState);
            });
        } catch (err) {
            console.error("Failed to update payment settings", err);
            setPaymentEnabled(!paymentEnabled);
        }
    };

    const handleToggleMayaJson = async () => {
        try {
            const newState = !mayaJsonEnabled;
            setMayaJsonEnabled(newState);
            import('../../api').then(async (api) => {
                await api.updateSystemSettings('maya_json_enabled', newState);
            });
        } catch (err) {
            console.error("Failed to update Maya JSON settings", err);
            setMayaJsonEnabled(!mayaJsonEnabled);
        }
    };

    const handleToggleGurujiJson = async () => {
        try {
            const newState = !gurujiJsonEnabled;
            setGurujiJsonEnabled(newState);
            import('../../api').then(async (api) => {
                await api.updateSystemSettings('guruji_json_enabled', newState);
            });
        } catch (err) {
            console.error("Failed to update Guruji JSON settings", err);
            setGurujiJsonEnabled(!gurujiJsonEnabled);
        }
    };

    const handleToggleWallet = async () => {
        try {
            const newState = !walletEnabled;
            setWalletEnabled(newState);
            await toggleWalletSystem(newState);
        } catch (err) {
            console.error("Failed to persist wallet state", err);
            setWalletEnabled(!walletEnabled); // Revert on error
        }
    };

    // Initialize state from settings API on load
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { getSystemSettings } = await import('../../api');
                const { data } = await getSystemSettings();
                if (data) {
                    if (typeof data.payment_enabled !== 'undefined') setPaymentEnabled(data.payment_enabled);
                    if (typeof data.maya_json_enabled !== 'undefined') setMayaJsonEnabled(data.maya_json_enabled);
                    if (typeof data.guruji_json_enabled !== 'undefined') setGurujiJsonEnabled(data.guruji_json_enabled);
                }
            } catch (e) {
                console.error("Failed to fetch settings", e);
            }
        };
        fetchSettings();
    }, []);

    const handleTestUpload = async () => {
        if (!testFile) return;
        setTestStatus("uploading");
        setTimeout(() => {
            setTestStatus("uploaded");
            setTestDocId("DOC_" + Math.random().toString(36).substr(2, 9).toUpperCase());
        }, 1500);
    };

    const handleTestProcess = async () => {
        setTestStatus("processing");
        setTimeout(() => {
            setTestStatus("ready");
            setTestMessages([{ role: 'system', content: 'Neural pipeline initialized. Context ready for querying.' }]);
        }, 2000);
    };

    const handleTestChat = async () => {
        if (!testInput.trim() || testChatLoading) return;
        const msg = testInput;
        setTestInput("");
        setTestMessages(prev => [...prev, { role: 'user', content: msg }]);
        setTestChatLoading(true);

        setTimeout(() => {
            setTestMessages(prev => [...prev, {
                role: 'bot',
                content: `Response based on document context for: "${msg}"`,
                context: ["Chunk 1: Source text fragment...", "Chunk 2: Relevant data point..."]
            }]);
            setTestChatLoading(false);
        }, 1000);
    };

    const handleExportSession = (session, format) => {
        if (!session || !session.chats) return;

        const sanitize = (html) => {
            if (!html) return '';
            return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        };

        const cleanMessage = (content, role) => {
            if (!content) return '';
            let text = content.toString();

            if ((role === 'guruji' || role === 'maya') && text.includes('{')) {
                try {
                    let cleanJson = text.trim();
                    if (cleanJson.startsWith('```')) {
                        const match = cleanJson.match(/```(?:json)?\s*(\{.*?\})\s*```/s);
                        if (match) cleanJson = match[1];
                        else cleanJson = cleanJson.replace(/^```(json)?\s*|\s*```$/g, '');
                    }
                    const parsed = JSON.parse(cleanJson);
                    if (role === 'guruji') {
                        text = [parsed.para1, parsed.para2, parsed.para3].filter(Boolean).join('\n\n');
                        if (parsed.follow_up || parsed.followup) {
                            text += `\n\n${parsed.follow_up || parsed.followup}`;
                        }
                    } else if (role === 'maya') {
                        text = parsed.message || '';
                    }
                } catch (e) { }
            }
            return sanitize(text);
        };

        const fileName = `session_${session.session_id}_${new Date().toISOString().split('T')[0]}`;
        let content = '';
        let mimeType = '';

        if (format === 'json') {
            const userId = userDetails.user?.mobile || 'user';
            const data = session.chats.map(chat => {
                const usage = chat.usage || chat.maya_usage || {};

                let label = chat.role || 'bot';
                if (label === 'user') label = `user-${userId}`;
                else if (label === 'guruji') label = 'astrologer';
                else if (label === 'maya') label = 'maya';

                let mayaRaw = null;
                if (chat.maya_json) {
                    mayaRaw = chat.maya_json;
                } else if (chat.role === 'maya') {
                    const raw = (chat.message || chat.user_message || chat.bot_response || '').toString();
                    if (raw.startsWith('```')) {
                        const match = raw.match(/```(?:json)?\s*(\{.*?\})\s*```/s);
                        if (match) {
                            try { mayaRaw = JSON.parse(match[1]); } catch (e) { mayaRaw = match[1]; }
                        } else {
                            const cleaned = raw.replace(/^```(json)?\s*|\s*```$/g, '');
                            try { mayaRaw = JSON.parse(cleaned); } catch (e) { mayaRaw = cleaned; }
                        }
                    } else if (raw.includes('{')) {
                        try { mayaRaw = JSON.parse(raw); } catch (e) { mayaRaw = raw; }
                    }
                }

                return {
                    role: label,
                    timestamp: chat.timestamp,
                    message: cleanMessage(chat.message || chat.user_message || chat.bot_response, chat.role),
                    maya_json: mayaRaw
                };
            }).filter(m => m.message);
            content = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
        } else if (format === 'csv') {
            const userId = userDetails.user?.mobile || 'user';
            const headers = ['Timestamp', 'Role', 'Message', 'Maya JSON'];
            const rows = session.chats.map(chat => {
                const msg = cleanMessage(chat.message || chat.user_message || chat.bot_response, chat.role);
                if (!msg) return null;

                let label = chat.role || 'bot';
                if (label === 'user') label = `user-${userId}`;
                else if (label === 'guruji') label = 'astrologer';
                else if (label === 'maya') label = 'maya';

                let mayaRaw = '';
                if (chat.maya_json) {
                    mayaRaw = typeof chat.maya_json === 'object' ? JSON.stringify(chat.maya_json) : chat.maya_json.toString();
                } else if (chat.role === 'maya') {
                    mayaRaw = (chat.message || chat.user_message || chat.bot_response || '').toString();
                    if (mayaRaw.startsWith('```')) {
                        const match = mayaRaw.match(/```(?:json)?\s*(\{.*?\})\s*```/s);
                        if (match) mayaRaw = match[1];
                        else mayaRaw = mayaRaw.replace(/^```(json)?\s*|\s*```$/g, '');
                    }
                }

                return [
                    `"${new Date(chat.timestamp * (chat.timestamp > 10000000000 ? 1 : 1000)).toLocaleString()}"`,
                    `"${label}"`,
                    `"${msg.replace(/"/g, '""')}"`,
                    `"${mayaRaw.replace(/"/g, '""')}"`
                ];
            }).filter(Boolean);
            content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            mimeType = 'text/csv';
        } else if (format === 'txt') {
            const userId = userDetails.user?.mobile || 'user';
            const lines = session.chats.map(chat => {
                const msg = cleanMessage(chat.message || chat.user_message || chat.bot_response, chat.role);
                if (!msg) return null;

                let label = chat.role || 'bot';
                if (label === 'user') label = `user-${userId}`;
                else if (label === 'guruji') label = 'astrologer';
                else if (label === 'maya') label = 'maya';

                let mayaStr = '';
                if (chat.maya_json) {
                    mayaStr = `\n[Maya JSON: ${typeof chat.maya_json === 'object' ? JSON.stringify(chat.maya_json) : chat.maya_json}]`;
                }

                return `${label}: ${msg}${mayaStr}`;
            }).filter(Boolean);
            content = lines.join('\n\n');
            mimeType = 'text/plain';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const processedSessions = [...(userDetails.sessions || [])]
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        .reduce((acc, s) => {
            // If no session_id, fallback to date-based legacy ID or 'legacy'
            const dateStr = s.timestamp ? (typeof s.timestamp === 'string' ? s.timestamp.split('T')[0] :
                new Date(s.timestamp * (s.timestamp > 10000000000 ? 1 : 1000)).toISOString().split('T')[0])
                : 'unknown';

            const sid = s.session_id || `legacy_${dateStr}`;
            if (!acc[sid]) {
                acc[sid] = {
                    session_id: sid,
                    timestamp: s.timestamp,
                    chats: [],
                    topic: 'Consultation'
                };
            }

            if (s.type === 'chat') {
                acc[sid].chats.push(s);
                if (acc[sid].topic === 'Consultation') {
                    const topicText = s.message || s.user_message || '...';
                    acc[sid].topic = topicText.slice(0, 40) + (topicText.length > 40 ? '...' : '');
                }
            }

            // Keep the latest timestamp for the session
            if (s.timestamp && (!acc[sid].timestamp || s.timestamp > acc[sid].timestamp)) {
                acc[sid].timestamp = s.timestamp;
            }

            return acc;
        }, {});

    const sortedSessions = Object.values(processedSessions)
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .filter(s => {
            if (!historyDateFilter) return true;
            if (!s.timestamp) return false;
            let d;
            if (typeof s.timestamp === 'string') d = new Date(s.timestamp);
            else if (s.timestamp > 10000000000) d = new Date(s.timestamp);
            else d = new Date(s.timestamp * 1000);
            return d.toISOString().split('T')[0] === historyDateFilter;
        });

    return (
        <div className="flex h-screen bg-black font-sans text-slate-100 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-20">
                <div className="p-8 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600"></div>
                    <div className="flex items-center space-x-4 mb-2">
                        <img
                            src="https://images.clickastro.com/ca-logo/ca_logo_with_tag_line_L.png"
                            alt="ClickAstro Logo"
                            className="h-10 object-contain"
                        />
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-white leading-none">Guruji AI</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Terminal v2.0</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Admin Dashboard</p>

                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <NavButton
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                        label="Dashboard"
                        themeColor="indigo"
                    />

                    <NavButton
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                        label="User Management"
                        themeColor="rose"
                    />

                    <NavButton
                        active={activeTab === 'maya'}
                        onClick={() => setActiveTab('maya')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                        label="Maya Prompt"
                        themeColor="violet"
                    />

                    <NavButton
                        active={activeTab === 'guruji'}
                        onClick={() => setActiveTab('guruji')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                        label="Guruji Short Prompt"
                        themeColor="orange"
                    />
                    <NavButton
                        active={activeTab === 'report-prompt'}
                        onClick={() => setActiveTab('report-prompt')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                        label="Guruji Detailed Prompt"
                        themeColor="emerald"
                    />
                    <NavButton
                        active={activeTab === 'system'}
                        onClick={() => setActiveTab('system')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                        label="Setup"
                        themeColor="slate"
                    />
                    <NavButton
                        active={activeTab === 'logs'}
                        onClick={() => setActiveTab('logs')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                        label="Log"
                        themeColor="indigo"
                    />
                    {/* <NavButton
                        active={activeTab === 'tester'}
                        onClick={() => setActiveTab('tester')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        label="RAG Testing"
                        themeColor="emerald"
                    /> */}

                    {/* <div className="mt-auto px-3 pb-4">
                        <NavButton
                            active={activeTab === 'system'}
                            onClick={() => setActiveTab('system')}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            label="Setup"
                            themeColor="slate"
                        />
                    </div> */}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'overview' ? (
                    <div className="flex-1 overflow-y-auto bg-black custom-scrollbar">
                        <DashboardOverview />
                    </div>
                ) : activeTab === 'users' ? (
                    <div className="flex-1 flex overflow-hidden lg:flex-row flex-col">
                        {/* User List Panel */}
                        <div className="w-full lg:w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col z-10 shadow-sm">
                            <div className="p-6 space-y-4">
                                <h2 className="text-2xl font-black text-white tracking-tight">Users</h2>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1 custom-scrollbar">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center p-8 space-y-2">
                                        <div className="w-6 h-6 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-bold text-slate-500">Loading Vault</p>
                                    </div>
                                ) : filteredUsers.map(user => (
                                    <button
                                        key={user.mobile}
                                        onClick={() => handleUserClick(user.mobile)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedUser === user.mobile ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400'}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm ${selectedUser === user.mobile ? 'bg-white/20' : 'bg-slate-800 text-slate-300'}`}>
                                                {user.name ? user.name[0].toUpperCase() : '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-black truncate ${selectedUser === user.mobile ? 'text-white' : 'text-slate-200'}`}>{user.name || 'Anonymous'}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-tighter ${selectedUser === user.mobile ? 'text-white/70' : 'text-slate-500'}`}>{user.mobile}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Details Panel */}
                        <div className="flex-1 bg-black overflow-hidden flex flex-col">
                            {!selectedUser ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
                                    <h3 className="text-xl font-black uppercase tracking-widest">Select User</h3>
                                </div>
                            ) : detailsLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="w-10 h-10 border-4 border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
                                        <div className="flex bg-black p-1 rounded-xl">
                                            {['history', 'wallet', 'profile'].map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setDetailTab(tab)}
                                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${detailTab === tab ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center space-x-3 text-right">
                                            <div>
                                                <p className="text-sm font-black leading-none text-white">{userDetails.user?.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500">{userDetails.user?.mobile}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                                                {userDetails.user?.name ? userDetails.user.name[0] : '?'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-hidden flex">
                                        {detailTab === 'history' && (
                                            <>
                                                <div className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col overflow-hidden">
                                                    <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Filter by Date</label>
                                                        <input
                                                            type="date"
                                                            value={historyDateFilter}
                                                            onChange={(e) => setHistoryDateFilter(e.target.value)}
                                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />
                                                        {historyDateFilter && (
                                                            <button
                                                                onClick={() => setHistoryDateFilter('')}
                                                                className="mt-2 text-[8px] font-black text-indigo-400 uppercase tracking-tighter hover:text-indigo-300"
                                                            >
                                                                Clear Filter
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                        {sortedSessions.map(session => (
                                                            <button
                                                                key={session.session_id}
                                                                onClick={() => setSelectedSessionId(session.session_id)}
                                                                className={`w-full text-left p-6 border-b border-slate-800 transition-all ${selectedSessionId === session.session_id ? 'bg-slate-800/50 border-r-2 border-r-indigo-500' : 'hover:bg-slate-800/30'}`}
                                                            >
                                                                <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">
                                                                    {session.timestamp ? (
                                                                        (typeof session.timestamp === 'string')
                                                                            ? new Date(session.timestamp).toLocaleDateString()
                                                                            : (session.timestamp > 10000000000)
                                                                                ? new Date(session.timestamp).toLocaleDateString()
                                                                                : new Date(session.timestamp * 1000).toLocaleDateString()
                                                                    ) : 'Consultation'}
                                                                </p>
                                                                <p className="text-sm font-bold text-slate-300 truncate">{session.topic}</p>
                                                                <p className="text-[10px] text-slate-500 mt-1 font-bold">{session.chats.length} interactions</p>
                                                            </button>
                                                        ))}
                                                        {sortedSessions.length === 0 && (
                                                            <div className="p-8 text-center text-slate-700 uppercase font-black text-[10px] tracking-widest">
                                                                No matching sessions
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                                    {selectedSessionId && processedSessions[selectedSessionId] ? (
                                                        <>
                                                            <div className="flex justify-between items-center mb-6 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                                                <div>
                                                                    <h3 className="text-lg font-black text-white">Session Detail</h3>
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{processedSessions[selectedSessionId].chats.length} interactions</p>
                                                                </div>
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleExportSession(processedSessions[selectedSessionId], 'csv')}
                                                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-indigo-400 rounded-xl transition-all border border-slate-700"
                                                                    >
                                                                        Export CSV
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleExportSession(processedSessions[selectedSessionId], 'json')}
                                                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-emerald-400 rounded-xl transition-all border border-slate-700"
                                                                    >
                                                                        Export JSON
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleExportSession(processedSessions[selectedSessionId], 'txt')}
                                                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-orange-400 rounded-xl transition-all border border-slate-700"
                                                                    >
                                                                        Export TXT
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-6">
                                                                {processedSessions[selectedSessionId].chats.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)).map((chat, i) => {
                                                                    const isUser = chat.role === 'user';
                                                                    const isMaya = chat.role === 'maya';
                                                                    const isGuruji = chat.role === 'guruji';

                                                                    let content = (chat.message || chat.user_message || chat.bot_response || '').toString();
                                                                    if (isGuruji && content.includes('{')) {
                                                                        try {
                                                                            let cleanJson = content.trim();
                                                                            if (cleanJson.startsWith('```')) {
                                                                                const match = cleanJson.match(/```(?:json)?\s*(\{.*?\})\s*```/s);
                                                                                if (match) cleanJson = match[1];
                                                                                else cleanJson = cleanJson.replace(/^```(json)?\s*|\s*```$/g, '');
                                                                            }
                                                                            const parsed = JSON.parse(cleanJson);
                                                                            content = [parsed.para1, parsed.para2, parsed.para3].filter(Boolean).join('<br><br>');
                                                                            if (parsed.follow_up || parsed.followup) {
                                                                                content += `<br><br><span class="opacity-50 italic">${parsed.follow_up || parsed.followup}</span>`;
                                                                            }
                                                                        } catch (e) { }
                                                                    }

                                                                    return (
                                                                        <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                                            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm ${isUser ? 'bg-indigo-600 text-white rounded-tr-none border border-indigo-500' :
                                                                                isMaya ? 'bg-violet-900/40 text-violet-100 rounded-tl-none border border-violet-800/50' :
                                                                                    'bg-slate-800 text-emerald-400 rounded-tl-none border border-slate-700'
                                                                                }`}>
                                                                                <div className="flex items-center space-x-2 mb-1 opacity-50 text-[9px] font-black uppercase tracking-widest">
                                                                                    <span>{chat.role || (chat.user_message ? 'user' : 'bot')}</span>
                                                                                    {chat.timestamp && (
                                                                                        <span>• {new Date(chat.timestamp * (chat.timestamp > 10000000000 ? 1 : 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="prose prose-invert max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
                                                                                {chat.category && isMaya && (
                                                                                    <div className="mt-2 text-[8px] font-black text-rose-400 uppercase tracking-tighter bg-rose-900/30 px-2 py-0.5 rounded inline-block">
                                                                                        Flag: {chat.category}
                                                                                    </div>
                                                                                )}
                                                                                {/* Dakshina cost label removed */}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                                                            <div className="p-4 bg-slate-900/50 rounded-full">
                                                                <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                            </div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Session Selected</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {detailTab === 'wallet' && (
                                            <div className="flex-1 overflow-y-auto p-8 bg-black custom-scrollbar">
                                                <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-900/30 mb-8">
                                                    <p className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-2">Balance</p>
                                                    <h4 className="text-4xl font-black">₹{userDetails.wallet?.balance?.toFixed(2) || '0.00'}</h4>
                                                </div>
                                                <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800/60 shadow-sm">
                                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Transactions</h5>
                                                    <table className="w-full text-left text-sm">
                                                        <thead>
                                                            <tr className="text-slate-600 text-[10px] font-black uppercase">
                                                                <th className="py-2">Date</th>
                                                                <th className="py-2">Descr</th>
                                                                <th className="py-2 text-right">Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-800/40">
                                                            {Array.isArray(userDetails.transactions) && userDetails.transactions.map((t, i) => (
                                                                <tr key={i} className="text-slate-300">
                                                                    <td className="py-3 font-mono text-xs text-slate-500">{t.timestamp ? new Date(t.timestamp * 1000).toLocaleDateString() : 'N/A'}</td>
                                                                    <td className="py-3 font-bold">{t.description}</td>
                                                                    <td className={`py-3 text-right font-black ${t.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                        {t.type === 'credit' ? '+' : '-'}₹{(t.amount || 0).toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                        {detailTab === 'profile' && (
                                            <div className="flex-1 overflow-y-auto p-12 bg-black flex justify-center custom-scrollbar">
                                                <div className="max-w-xl w-full">
                                                    <h3 className="text-2xl font-black text-white mb-8">Personal DNA</h3>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        {[
                                                            { label: 'Name', value: userDetails.profile?.name },
                                                            { label: 'Mobile', value: userDetails.profile?.mobile },
                                                            { label: 'Email', value: userDetails.profile?.email || 'N/A' },
                                                            { label: 'Birth', value: `${userDetails.profile?.dob || ''} ${userDetails.profile?.tob || ''}` },
                                                            { label: 'Place', value: userDetails.profile?.pob || 'N/A' },
                                                            { label: 'Gender', value: userDetails.profile?.gender || 'N/A' }
                                                        ].map((item, i) => (
                                                            <div key={i} className="space-y-1">
                                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{item.label}</label>
                                                                <p className="bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 text-sm font-bold text-slate-300">{item.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'maya' ? (
                    <div className="flex-1 overflow-y-auto p-12 bg-black">
                        <EditMayaPrompt />
                    </div>
                ) : activeTab === 'system' ? (
                    <div className="flex-1 overflow-y-auto p-12 bg-black">
                        <div className="max-w-xl mx-auto">
                            <h2 className="text-2xl font-black text-white mb-6">System Control</h2>
                            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/60 space-y-6">
                                {/* Payment Gateway Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-slate-200">Payment Gateway</h3>
                                        <p className="text-xs text-slate-500">Enable/Disable global payments (Dakshina, Recharge)</p>
                                    </div>
                                    <button
                                        onClick={handleTogglePayment}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${paymentEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 bg-white rounded-full transition-transform ${paymentEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {/* Wallet System Toggle */}
                                <div className="flex items-center justify-between pt-6 border-t border-slate-800/60">
                                    <div>
                                        <h3 className="font-black text-slate-200">Wallet System</h3>
                                        <p className="text-xs text-slate-500">Enable/Disable user wallet balance & transactions</p>
                                    </div>
                                    <button
                                        onClick={handleToggleWallet}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${walletEnabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 bg-white rounded-full transition-transform ${walletEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {/* Maya JSON Toggle */}
                                <div className="flex items-center justify-between pt-6 border-t border-slate-800/60">
                                    <div>
                                        <h3 className="font-black text-slate-200">Maya JSON Output</h3>
                                        <p className="text-xs text-slate-500">Show raw JSON classification from Maya in chat bubbles</p>
                                    </div>
                                    <button
                                        onClick={handleToggleMayaJson}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${mayaJsonEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 bg-white rounded-full transition-transform ${mayaJsonEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {/* Guruji JSON Toggle */}
                                <div className="flex items-center justify-between pt-6 border-t border-slate-800/60">
                                    <div>
                                        <h3 className="font-black text-slate-200">Guruji JSON Output</h3>
                                        <p className="text-xs text-slate-500">Show raw structured response from Guruji in chat bubbles</p>
                                    </div>
                                    <button
                                        onClick={handleToggleGurujiJson}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${gurujiJsonEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 bg-white rounded-full transition-transform ${gurujiJsonEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'guruji' ? (
                    <div className="flex-1 overflow-y-auto p-12 bg-black">
                        <SystemPromptEditor />
                    </div>
                ) : activeTab === 'report-prompt' ? (
                    <div className="flex-1 overflow-y-auto p-12 bg-black">
                        <ReportPromptEditor />
                    </div>
                ) : activeTab === 'logs' ? (
                    <div className="flex-1 overflow-y-auto bg-black custom-scrollbar">
                        <LoginLogs />
                    </div>
                ) : activeTab === 'tester' ? (
                    <div className="flex-1 overflow-y-auto p-8 bg-black flex justify-center custom-scrollbar">
                        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">1. Neural Seed</h3>
                                    <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${testFile ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800'}`}>
                                        <input type="file" id="tFile" className="hidden" onChange={(e) => { setTestFile(e.target.files[0]); setTestStatus("idle"); }} />
                                        <label htmlFor="tFile" className="cursor-pointer block">
                                            <p className="text-xs font-bold text-slate-300 mb-1">{testFile ? testFile.name : "Choose Dataset"}</p>
                                            <p className="text-[9px] text-slate-600 uppercase">Max 50MB PDF/DOCX</p>
                                        </label>
                                    </div>
                                    <button onClick={handleTestUpload} disabled={!testFile || testStatus !== 'idle'} className={`w-full mt-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${testFile && testStatus === 'idle' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-slate-800 text-slate-600'}`}>Upload</button>
                                    <button onClick={handleTestProcess} disabled={testStatus !== 'uploaded'} className={`w-full mt-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${testStatus === 'uploaded' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'bg-slate-800 text-slate-600'}`}>Quantize RAG</button>
                                </div>
                                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-600">
                                        <span>Pipeline</span>
                                        <span className={testStatus === 'ready' ? 'text-indigo-400' : ''}>{testStatus}</span>
                                    </div>
                                    {testDocId && <p className="text-[9px] font-mono text-slate-600 mt-2 truncate">{testDocId}</p>}
                                </div>
                            </div>

                            <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
                                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-600">2. Interaction Layer</span>
                                    {testStatus === 'ready' && <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span><span className="text-[9px] font-black text-indigo-500 uppercase">Live</span></div>}
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                    {testMessages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'bg-slate-800 text-slate-200'}`}>
                                                {m.role === 'bot' ? <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: m.content }} /> : m.content}
                                                {m.context && (
                                                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap gap-1">
                                                        {m.context.map((c, idx) => <span key={idx} className="text-[8px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-slate-500 font-bold">{c}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {testChatLoading && <div className="text-[10px] font-black text-slate-600 animate-pulse uppercase">Syncing...</div>}
                                </div>
                                <div className="p-4 border-t border-slate-800">
                                    <div className="flex space-x-2">
                                        <input type="text" value={testInput} onChange={(e) => setTestInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleTestChat()} placeholder="Inquire document context..." disabled={testStatus !== 'ready'} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 placeholder-slate-600" />
                                        <button onClick={handleTestChat} disabled={testStatus !== 'ready' || !testInput.trim()} className={`p-3 rounded-xl transition-all ${testStatus === 'ready' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'bg-slate-800 text-slate-600'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;

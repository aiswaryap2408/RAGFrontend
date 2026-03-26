import React, { useState, useEffect } from 'react';
import {
    getMonetizationRules,
    createMonetizationRule,
    updateMonetizationRule,
    deleteMonetizationRule
} from '../../api';

const MonetizationRules = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        route: 'FORWARD_GURUJI',
        mood: [],
        domain: [],
        timeframe: [],
        timeframe_exclude: [],
        min_questions: 5,
        amount: 0,
        actual_chat_payment_amount: 0,
        is_active: true,
        priority: 100,
        category: 'All'
    });

    const options = {
        moods: ['NEUTRAL', 'ANXIOUS', 'CONFUSED', 'DISTRESSED', 'HOPEFUL'],
        domains: ['RELATIONSHIP', 'CAREER', 'HEALTH', 'FINANCE', 'GENERAL'],
        timeframes: ['IMMEDIATE', 'SHORT_TERM', 'MIDTERM', 'LONG_TERM', 'NONE']
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const { data } = await getMonetizationRules();
            setRules(data.rules || []);
        } catch (error) {
            console.error('Error fetching monetization rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (rule = null) => {
        if (rule) {
            setEditingRule(rule);
            setFormData({
                name: rule.name || '',
                route: rule.route || 'FORWARD_GURUJI',
                mood: rule.mood || [],
                domain: rule.domain || [],
                timeframe: rule.timeframe || [],
                timeframe_exclude: rule.timeframe_exclude || [],
                min_questions: rule.min_questions || 0,
                amount: rule.amount || 0,
                actual_chat_payment_amount: rule.actual_chat_payment_amount || 0,
                is_active: rule.is_active !== undefined ? rule.is_active : true,
                priority: rule.priority || 100,
                category: rule.category || 'All'
            });
        } else {
            setEditingRule(null);
            setFormData({
                name: '',
                route: 'FORWARD_GURUJI',
                mood: [],
                domain: [],
                timeframe: [],
                timeframe_exclude: [],
                min_questions: 5,
                amount: 0,
                actual_chat_payment_amount: 0,
                is_active: true,
                priority: 100,
                category: 'All'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRule(null);
    };

    const handleMultiSelect = (field, value) => {
        setFormData(prev => {
            const current = [...prev[field]];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRule && editingRule.id) {
                await updateMonetizationRule(editingRule.id, formData);
            } else {
                await createMonetizationRule(formData);
            }
            fetchRules();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving rule:', error);
            alert('Failed to save rule. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this rule? This cannot be undone.')) {
            try {
                await deleteMonetizationRule(id);
                fetchRules();
            } catch (error) {
                console.error('Error deleting rule:', error);
                alert('Failed to delete rule.');
            }
        }
    };

    const MultiSelectBadge = ({ field, label, optionsList }) => (
        <div className="mb-4">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
            <div className="flex flex-wrap gap-2">
                {optionsList.map(opt => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => handleMultiSelect(field, opt)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${formData[field].includes(opt)
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-white">Monetization Rules</h2>
                    <p className="text-slate-400 text-sm mt-1">Configure dynamic payment walls.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-900/20"
                >
                    + Add New Rule
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50 border-b border-slate-800/80">
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Priority</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Name / Context</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Conditions</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actual Price (₹)</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Offer Price (₹)</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {rules.map(rule => (
                                    <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-4 whitespace-nowrap">
                                            <span className="text-xs font-black text-slate-400 bg-slate-800 px-2 py-1 rounded-md">{rule.priority}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-white mb-1">{rule.name}</div>
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{rule.route}</div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className="text-xs font-bold text-slate-300">{rule.category || 'All'}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {rule.mood?.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Mood: {rule.mood.join(', ')}</span>}
                                                {rule.domain?.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Domain: {rule.domain.join(', ')}</span>}
                                                {rule.timeframe?.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Time: {rule.timeframe.join(', ')}</span>}
                                                {rule.timeframe_exclude?.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">Not Time: {rule.timeframe_exclude.join(', ')}</span>}
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Min Qs: {rule.min_questions}</span>
                                            </div>
                                            {(!rule.mood?.length && !rule.domain?.length && !rule.timeframe?.length && !rule.timeframe_exclude?.length) && (
                                                <span className="text-[10px] text-slate-500 italic">Matches any context</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <span className="text-sm font-bold text-slate-400 line-through mr-2">₹{rule.actual_chat_payment_amount || 0}</span>
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <span className="text-lg font-black text-emerald-400">₹{rule.amount}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${rule.is_active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></span>
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(rule)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(rule.id)} className="p-2 bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 rounded-lg transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rules.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                            No rules configured
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Config Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center py-10 px-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 w-full max-w-3xl max-h-full overflow-y-auto rounded-3xl border border-slate-800 shadow-2xl custom-scrollbar flex flex-col">
                        <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-6 flex justify-between items-center z-10">
                            <h3 className="text-xl font-black text-white">{editingRule ? 'Edit Rule' : 'Add New Rule'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Rule Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                                        placeholder="e.g. Anxious Career Query"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                                        placeholder="e.g. All, WhatsApp"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Message Route</label>
                                    <select
                                        value={formData.route}
                                        onChange={e => setFormData({ ...formData, route: e.target.value })}
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 appearance-none"
                                    >
                                        <option value="">Any Route (Wildcard)</option>
                                        <option value="FORWARD_GURUJI">FORWARD_GURUJI</option>
                                        <option value="MAYA_HANDLE">MAYA_HANDLE</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/80">
                                <h4 className="text-sm font-black text-white mb-4">Context Modifiers</h4>
                                <p className="text-xs text-slate-500 mb-4">Select multiple values. Leave empty to allow any value (Wildcard).</p>

                                <MultiSelectBadge field="mood" label="Allowed Moods" optionsList={options.moods} />
                                <MultiSelectBadge field="domain" label="Allowed Domains" optionsList={options.domains} />
                                <MultiSelectBadge field="timeframe" label="Allowed Timeframes" optionsList={options.timeframes} />
                                <MultiSelectBadge field="timeframe_exclude" label="Excluded Timeframes (Overrides Allowed)" optionsList={options.timeframes} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Min. Questions</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.min_questions}
                                        onChange={e => setFormData({ ...formData, min_questions: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Triggers after this many free questions.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Before Offer (Actual ₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={formData.actual_chat_payment_amount}
                                        onChange={e => setFormData({ ...formData, actual_chat_payment_amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Offer Price (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-emerald-400 font-black text-lg focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Lower number = checked first.</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${formData.is_active ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm font-bold text-white">Rule is Active</span>
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-900/40 transition-all hover:-translate-y-0.5"
                                >
                                    Save Rule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonetizationRules;

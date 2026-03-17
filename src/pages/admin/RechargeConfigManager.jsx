import React, { useState, useEffect } from 'react';
import {
    getRechargeConfigs,
    createRechargeConfig,
    updateRechargeConfig,
    deleteRechargeConfig
} from '../../api';

const RechargeConfigManager = () => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [formData, setFormData] = useState({
        amount: 0,
        points: 0,
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const { data } = await getRechargeConfigs();
            setConfigs(data || []);
        } catch (error) {
            console.error('Error fetching recharge configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (config = null) => {
        if (config) {
            setEditingConfig(config);
            setFormData({
                amount: config.amount || 0,
                points: config.points || 0,
                description: config.description || '',
                is_active: config.is_active !== undefined ? config.is_active : true
            });
        } else {
            setEditingConfig(null);
            setFormData({
                amount: 0,
                points: 0,
                description: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingConfig(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingConfig && editingConfig.config_id) {
                await updateRechargeConfig(editingConfig.config_id, formData);
            } else {
                await createRechargeConfig(formData);
            }
            fetchConfigs();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Failed to save configuration. Please try again.');
        }
    };

    const handleDelete = async (configId) => {
        if (window.confirm('Are you sure you want to delete this configuration?')) {
            try {
                await deleteRechargeConfig(configId);
                fetchConfigs();
            } catch (error) {
                console.error('Error deleting config:', error);
                alert('Failed to delete configuration.');
            }
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-white">Wallet Recharge Configuration</h2>
                    <p className="text-slate-400 text-sm mt-1">Manage recharge amounts and corresponding points.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-900/20"
                >
                    + Add New Option
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
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount (₹)</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Points</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Description</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {configs.map(config => (
                                    <tr key={config.config_id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-4 whitespace-nowrap">
                                            <span className="text-lg font-black text-white">₹{config.amount}</span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className="text-lg font-black text-indigo-400">{config.points} pts</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-slate-400">{config.description || '-'}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${config.is_active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></span>
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(config)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(config.config_id)} className="p-2 bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 rounded-lg transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {configs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                            No configurations found
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
                    <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl flex flex-col">
                        <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-6 flex justify-between items-center z-10">
                            <h3 className="text-xl font-black text-white">{editingConfig ? 'Edit Option' : 'Add New Option'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                                        placeholder="e.g. 500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Points</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.points}
                                        onChange={e => setFormData({ ...formData, points: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-indigo-400 font-black focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                                        placeholder="e.g. 500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                                        placeholder="Optional description..."
                                        rows="3"
                                    />
                                </div>
                                <div className="flex items-center space-x-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${formData.is_active ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                    <span className="text-sm font-bold text-white">Active</span>
                                </div>
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
                                    Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RechargeConfigManager;

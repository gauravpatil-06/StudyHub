import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Zap, Clock, CheckSquare, RefreshCw, Info, Search, Trash2, TrendingUp, ArrowUpDown } from 'lucide-react';
import api from '../../utils/api';
import { PageLoader } from '../../components/ui/PageLoader';
import { PageHeader } from '../../components/ui/PageHeader';
import { toast } from 'react-hot-toast';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';

export const AdminLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [deletingId, setDeletingId] = useState(null);
    const [filters, setFilters] = useState({
        searchTerm: '',
        from: '',
        to: '',
        timeFilter: 'all',
        sortBy: 'latest'
    });

    const filterOpts = [
        { id: 'all', label: 'All' },
        { id: '7d', label: 'Last 7 Days' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'yearly', label: 'Yearly' }
    ];

    const fetchLeaderboard = async () => {
        try {
            const [lbResponse, activityResponse] = await Promise.all([
                api.get('/admin/leaderboard'),
                api.get('/admin/activity')
            ]);
            setLeaderboard(lbResponse.data || []);
            setActivities(activityResponse.data || []);
        } catch (error) {
            console.error('Failed to fetch leaderboard data', error);
            toast.error('Failed to sync live rankings');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchLeaderboard();
        setRefreshKey(prev => prev + 1);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 600);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            setLeaderboard(leaderboard.filter(u => u._id !== deletingId));
            toast.success('Entry removed from leaderboard');
        } catch (error) {
            toast.error('Failed to remove entry');
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const handleTimePillClick = (id) => {
        setFilters(prev => ({ ...prev, timeFilter: id, from: '', to: '' }));
    };

    const filteredLeaderboard = useMemo(() => {
        // 1. Determine Date Range
        let fromDate = filters.from ? new Date(filters.from) : null;
        let toDate = filters.to ? new Date(filters.to) : null;

        if (filters.timeFilter && filters.timeFilter !== 'all') {
            const now = new Date();
            if (filters.timeFilter === '7d') fromDate = subDays(now, 7);
            else if (filters.timeFilter === 'monthly') fromDate = startOfMonth(now);
            else if (filters.timeFilter === 'yearly') fromDate = startOfYear(now);
            toDate = now;
        }

        // 2. Aggregate actual minutes from activity table based on selected range
        const userMinutesMap = {};
        activities.forEach(act => {
            if (!act.userId?._id) return;
            const actDate = new Date(act.createdAt || act.date);

            let inRange = true;
            if (fromDate) {
                const start = new Date(fromDate);
                start.setHours(0, 0, 0, 0);
                if (actDate < start) inRange = false;
            }
            if (toDate && inRange) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                if (actDate > end) inRange = false;
            }

            if (inRange) {
                userMinutesMap[act.userId._id] = (userMinutesMap[act.userId._id] || 0) + (act.minutes || 0);
            }
        });

        // 3. Map leaderboard with correct dynamic hours
        let result = leaderboard.map(u => ({
            ...u,
            studyHours: (userMinutesMap[u._id] || 0) / 60
        }));

        // 4. Basic filtering (Search & Deleted User)
        result = result.filter(u => u.name && u.name.toLowerCase() !== 'deleted user');

        if (filters.searchTerm) {
            const query = filters.searchTerm.toLowerCase().trim();
            result = result.filter(u => u.name.toLowerCase().includes(query));
        }

        // 5. Leaderboard Sort Logic (Primary focus on dynamic hours)
        result.sort((a, b) => b.studyHours - a.studyHours);

        if (filters.sortBy === 'oldest') {
            result.reverse();
        }

        return result;
    }, [leaderboard, activities, filters]);

    // PageLoader handled by AppLayout transition

    return (
        <div className="space-y-6 pb-10 max-w-full mx-auto px-0">
            {/* Header Area */}
            <PageHeader
                icon={Trophy}
                title="Global Leaderboard"
                subtitle="Tracking top performers and consistency across the entire platform."
                right={
                    <div className="flex items-center gap-2">
                        <motion.div
                            key={refreshKey}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="hidden lg:flex items-center gap-3 px-6 py-2.5 bg-[#47C4B7] rounded-xl shadow-lg shadow-[#47C4B7]/25 border border-transparent hover:border-white/50 transition-all cursor-default relative overflow-hidden min-w-[220px]"
                        >
                            {/* Trading Terminal Grid BG */}
                            <div className="absolute inset-0 opacity-[0.1] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '12px 12px' }}>
                            </div>

                            {/* Refined Performance Sparkline BG */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.25]">
                                <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                                    <path
                                        d="M0,55 L20,48 L40,52 L60,40 L80,45 L100,30 L120,35 L140,15 L160,20 L180,5 L200,8"
                                        stroke="white"
                                        strokeWidth="3"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M0,55 L20,48 L40,52 L60,40 L80,45 L100,30 L120,35 L140,15 L160,20 L180,5 L200,8 L200,60 L0,60 Z"
                                        fill="white"
                                        opacity="0.2"
                                    />
                                    <circle cx="180" cy="5" r="3" fill="white" className="animate-pulse" />
                                </svg>
                            </div>

                            <div className="relative z-10 w-full text-center sm:text-left">
                                <p className="text-[10px] font-bold text-white/90 tracking-wide">Top Performers</p>
                                <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                                    <span className="text-3xl font-black tabular-nums text-white leading-tight">{filteredLeaderboard.length}</span>
                                    <span className="text-[11px] font-black text-white/80 uppercase">Students</span>
                                </div>
                                <p className="text-[9px] font-semibold text-white/60 italic mt-0.5 whitespace-nowrap">Actively competing for Rank 1</p>
                            </div>
                        </motion.div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`shrink-0 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 hover:text-[#47C4B7] transition-all hover:shadow-md ${isRefreshing ? 'cursor-not-allowed opacity-50' : ''}`}
                            title="Refresh Data"
                        >
                            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : 'hover:rotate-180 transition-transform duration-500'} />
                        </button>
                    </div>
                }
            />

            <div className="flex lg:hidden justify-end mb-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-[#47C4B7] rounded-xl shadow-lg border border-transparent hover:border-white/50 transition-all cursor-default relative overflow-hidden w-full max-w-[240px]">
                    {/* Grid Overlay for Mobile */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                    </div>

                    <div className="absolute inset-0 pointer-events-none opacity-[0.22]">
                        <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                            <path
                                d="M0,55 L40,50 L80,35 L120,40 L160,15 L200,5"
                                stroke="white"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <div className="relative z-10 w-full">
                        <p className="text-[10px] font-bold text-white/90">Top Performers</p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black tabular-nums text-white">{filteredLeaderboard.length}</span>
                            <span className="text-[11px] font-black text-white/80 uppercase">Students</span>
                        </div>
                        <p className="text-[9px] font-semibold text-white/60 italic mt-0.5">Actively competing for Rank 1</p>
                    </div>
                </div>
            </div>

            <motion.div
                key={refreshKey}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                {/* Filter Bar */}
                <div className="p-0 sm:p-0 mb-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="filter-bar"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col gap-3"
                        >
                            {/* Primary Filter Row: Search + Secondary Filters */}
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
                                {/* Search */}
                                <div className="relative flex-1 group">
                                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isRefreshing ? 'text-[#47C4B7] animate-pulse' : 'text-gray-400'}`} size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by student name..."
                                        value={filters.searchTerm}
                                        onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                                        className="w-full pl-11 pr-4 py-2 sm:py-2.5 bg-transparent border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-1 focus:ring-[#47C4B7]/30 focus:border-[#47C4B7] text-[15px] text-gray-900 dark:text-white outline-none transition-all placeholder-gray-400 shadow-sm"
                                    />
                                </div>

                                {/* Secondary Filters Container - 3 Separate Distinct Boxes */}
                                <div className="flex flex-row flex-nowrap items-center justify-start gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                                    {/* Box 1: From Date */}
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all whitespace-nowrap bg-transparent text-gray-500/80 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700">
                                        <input
                                            type={filters.from ? "date" : "text"}
                                            placeholder="DD-MM-YYYY"
                                            onFocus={(e) => (e.target.type = "date")}
                                            onBlur={(e) => !e.target.value && (e.target.type = "text")}
                                            value={filters.from}
                                            onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value, timeFilter: '' }))}
                                            className="bg-transparent border-none text-[11px] font-black focus:ring-0 p-0 w-[105px] text-gray-500/80 hover:text-gray-500 outline-none uppercase"
                                        />
                                    </div>

                                    {/* Box 2: To Date */}
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all whitespace-nowrap bg-transparent text-gray-500/80 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700">
                                        <input
                                            type={filters.to ? "date" : "text"}
                                            placeholder="DD-MM-YYYY"
                                            onFocus={(e) => (e.target.type = "date")}
                                            onBlur={(e) => !e.target.value && (e.target.type = "text")}
                                            value={filters.to}
                                            onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value, timeFilter: '' }))}
                                            className="bg-transparent border-none text-[11px] font-black focus:ring-0 p-0 w-[105px] text-gray-500/80 hover:text-gray-500 outline-none uppercase"
                                        />
                                    </div>

                                    {/* Box 3: Sort */}
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, sortBy: prev.sortBy === 'latest' ? 'oldest' : 'latest' }))}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all whitespace-nowrap bg-transparent text-gray-500/80 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 min-w-[75px] justify-center"
                                    >
                                        <ArrowUpDown size={11} className="text-[#47C4B7]" />
                                        {filters.sortBy === 'latest' ? 'Newest' : 'Oldest'}
                                    </button>
                                </div>
                            </div>

                            {/* Row: Time Pills */}
                            <div className="flex items-center gap-2 flex-nowrap overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                                {filterOpts.map(pill => (
                                    <button
                                        key={pill.id}
                                        onClick={() => handleTimePillClick(pill.id)}
                                        className={`px-4 py-1.5 rounded-lg text-[11px] font-black capitalize transition-all whitespace-nowrap ${filters.timeFilter === pill.id
                                            ? 'bg-[#47C4B7] text-white shadow-lg shadow-[#47C4B7]/20 border-none'
                                            : 'bg-transparent text-gray-500/80 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
                                            }`}
                                    >
                                        {pill.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Table Area */}
                <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/20 rounded-3xl shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1200px] border-hidden">
                        <thead className="text-center">
                            <tr className="bg-[#47C4B7]/10 dark:bg-[#47C4B7]/5 border-b-2 border-gray-800/20 dark:border-white/40">
                                <th className="px-3 py-5 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/20 dark:border-white/40 w-20">Sr. No.</th>
                                <th className="px-3 py-5 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/20 dark:border-white/40 w-24">Rank</th>
                                <th className="px-[15px] py-5 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/20 dark:border-white/40 w-1">User Name</th>
                                <th className="px-5 py-5 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/20 dark:border-white/40">Streak</th>
                                <th className="px-5 py-5 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/20 dark:border-white/40">Study Time</th>
                                <th className="px-5 py-5 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center border-r border-gray-800/20 dark:border-white/40">Tasks</th>
                                <th className="px-5 py-5 text-[11px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest whitespace-nowrap text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/20 dark:divide-white/40 border-b border-gray-800/20 dark:border-white/40">
                            <AnimatePresence mode='popLayout'>
                                {filteredLeaderboard.map((u, i) => (
                                    <motion.tr
                                        key={u._id || i}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="hover:bg-[#47C4B7]/5 dark:hover:bg-[#47C4B7]/5 transition-colors group"
                                    >
                                        {/* Sr No */}
                                        <td className="px-5 py-5 text-center border-r border-gray-800/20 dark:border-white/40">
                                            <span className="text-xs font-black text-gray-800 dark:text-gray-200">{String(i + 1).padStart(2, '0')}</span>
                                        </td>

                                        {/* Rank */}
                                        <td className="px-6 py-5 text-center border-r border-gray-800/20 dark:border-white/40">
                                            <div className="flex flex-col items-center justify-center">
                                                {i === 0 ? <Crown size={24} className="text-amber-400 drop-shadow-sm" /> :
                                                    i === 1 ? <Medal size={24} className="text-gray-400" /> :
                                                        i === 2 ? <Medal size={24} className="text-amber-700" /> :
                                                            <span className="text-xs font-black text-gray-800 dark:text-gray-200 group-hover:text-[#47C4B7]">{String(i + 1).padStart(2, '0')}</span>}
                                            </div>
                                        </td>

                                        {/* User Name */}
                                        <td className="px-[15px] py-5 border-r border-gray-800/20 dark:border-white/40 text-center">
                                           <div className="flex items-center justify-center gap-3">
                                                {u.avatar ? (
                                                    <img
                                                        src={u.avatar}
                                                        alt={u.name}
                                                        className="w-9 h-9 rounded-full object-cover border-2 border-[#47C4B7]/20 shadow-sm shrink-0 p-[2px] bg-white dark:bg-gray-800"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/default-avatar.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-black text-[13px] border border-[#47C4B7]/20 ${i === 0 ? 'bg-amber-400/10 text-amber-500' : 'bg-[#47C4B7]/10 text-[#47C4B7]'}`}>
                                                        {u.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="text-xs font-black text-gray-900 dark:text-white whitespace-nowrap">{u.name}</span>
                                            </div>
                                        </td>

                                        {/* Streak */}
                                        <td className="px-6 py-5 text-center border-r border-gray-800/20 dark:border-white/40">
                                            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-[#47C4B7]">
                                                <Zap size={14} className="fill-current" />
                                                <span className="text-sm font-black">{u.streak}d</span>
                                            </div>
                                        </td>

                                        {/* Study Time */}
                                        <td className="px-6 py-5 text-center border-r border-gray-800/20 dark:border-white/40">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-baseline gap-1 text-amber-500 font-black">
                                                    <span className="text-sm">{Math.floor(u.studyHours)}</span>
                                                    <span className="text-[10px] text-amber-500/70">HRS</span>
                                                    <span className="text-sm ml-1">{Math.round((u.studyHours % 1) * 60)}</span>
                                                    <span className="text-[10px] text-amber-500/70">MINS</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-tight">TOTAL</span>
                                            </div>
                                        </td>

                                        {/* Tasks */}
                                        <td className="px-6 py-5 text-center border-r border-gray-800/20 dark:border-white/40">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1.5 text-pink-500 font-black">
                                                    <CheckSquare size={16} />
                                                    <span className="text-sm">{u.completedTasks}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">TOTAL</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() => setDeletingId(u._id)}
                                                className="p-2.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl dark:bg-red-500/10 transition-all active:scale-90"
                                                title="Delete Entry"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredLeaderboard.length === 0 && (
                        <div className="py-16 sm:py-24 text-center">
                            <div className="bg-[#47C4B7]/10 w-12 h-12 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <Info size={24} className="text-[#47C4B7]" />
                            </div>
                            <p className="text-[12px] sm:text-sm text-gray-400 font-bold italic px-4">No leaderboard data found.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
            <AnimatePresence>
                {deletingId && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-[340px] shadow-2xl text-center border border-gray-100 dark:border-gray-800"
                        >
                            <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-4 border border-red-100 dark:border-red-500/20">
                                <Trash2 size={24} />
                            </div>

                            <h3 className="text-[1.05rem] font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Remove from Leaderboard?</h3>
                            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-6">
                                This entry will be permanently removed.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingId(null)}
                                    className="flex-1 py-3 text-[15px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition"
                                >
                                    No, keep it
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3 text-[15px] font-bold bg-[#47C4B7] text-white rounded-xl hover:bg-[#3db3a6] shadow-lg shadow-[#47C4B7]/25 transition"
                                >
                                    Yes, remove
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

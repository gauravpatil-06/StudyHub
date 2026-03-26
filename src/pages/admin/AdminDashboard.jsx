import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, BookOpen, ShieldAlert, BarChart3, Activity,
    CheckCircle2, Clock, FileText, Trophy, RefreshCw,
    TrendingUp, ExternalLink, Award, Flame, Timer, StopCircle,
    Search, Filter, ArrowUpDown, Calendar
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar, Cell, Legend
} from 'recharts';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/ui/PageLoader';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';

const TEAL = '#47C4B7';
const INDIGO = '#6366f1';
const ROSE = '#f43f5e';
const AMBER = '#f59e0b';
const PURPLE = '#a855f7';

/* ─────────────────────────────────────────────────────────────────
   Inline styles for the zoom + border hover effect on stat cards
   (CSS-in-JS so no external stylesheet is required)
───────────────────────────────────────────────────────────────── */
const cardBaseStyle = {
    cursor: 'zoom-in',
    transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease, border-color 0.28s ease',
};

const cardHoverStyle = {
    transform: 'scale(1.07) translateY(-6px)',
    boxShadow: '0 20px 40px -8px rgba(71,196,183,0.22), 0 8px 16px -4px rgba(71,196,183,0.12)',
    borderColor: 'rgba(71,196,183,0.6)',
};

/* Interactive card that shows zoom + teal border on hover */
const HoverCard = ({ children, className, style, delay, rKey, extraHover = {} }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            key={rKey}
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay, ease: [0.23, 1, 0.32, 1] }}
            className={className}
            style={{
                ...cardBaseStyle,
                ...(hovered ? { ...cardHoverStyle, ...extraHover } : {}),
                ...style,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children}
        </motion.div>
    );
};

/* ─── Helpers & Static Components ─── */
const formatDisplayTime = (decimalHours) => {
    const totalMinutes = Math.round(parseFloat(decimalHours || 0) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours} hrs ${minutes} min`;
    if (hours > 0) return `${hours} hrs`;
    return `${minutes} min`;
};

const StatCard = ({ label, value, icon: Icon, colorClass, delay, rKey, borderColorClass, path }) => {
    const content = (
        <HoverCard
            rKey={rKey}
            delay={delay}
            className={`glass-card bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-1 xl:p-2.5 flex flex-col justify-center shadow-xl h-full min-h-[70px] ${borderColorClass || ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-full ${colorClass.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
                        <Icon size={18} className={`${colorClass} shrink-0`} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <p className="text-[clamp(11px,1.2vw,15px)] font-bold text-gray-500 dark:text-gray-400 truncate tracking-tight mb-0.5">{label}</p>
                        <h3 className="text-[clamp(10px,1.1vw,13px)] font-black text-gray-600 dark:text-gray-400 leading-none tracking-tight truncate">
                            {value}
                        </h3>
                    </div>
                </div>
            </div>
        </HoverCard>
    );

    return path ? (
        <Link to={path} className="block no-underline h-full">
            {content}
        </Link>
    ) : content;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const pData = payload[0].payload;
    const studyVal = parseFloat(pData.study || 0);
    const codingVal = parseFloat(pData.coding || 0);
    const watchingVal = parseFloat(pData.watching || 0);
    const countdownVal = parseFloat(pData.countdown || 0);
    const stopwatchVal = parseFloat(pData.stopwatch || 0);
    const totalVal = parseFloat(pData.hours || 0);

    const formatVal = (val) => val > 0 ? formatDisplayTime(val) : '—';

    const Row = ({ label, value, labelColor = "text-gray-900 dark:text-white", valueColor = "text-teal-700 dark:text-[#47C4B7]" }) => (
        <div className="flex items-center justify-between gap-4">
            <span className={`text-[13px] font-bold capitalize ${labelColor}`}>{label}:</span>
            <span className={`text-[13px] font-bold ${valueColor}`}>{value}</span>
        </div>
    );

    return (
        <div className="relative bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg shadow-xl drop-shadow-md min-w-[160px]">
             <div className="absolute w-3.5 h-3.5 bg-white dark:bg-gray-900 border-b border-l border-gray-300 dark:border-gray-600 transform -rotate-45 -bottom-[7.5px] left-2.5 rounded-bl-[2px] pointer-events-none"></div>
            <p className="text-[10px] font-black text-[#47C4B7] tracking-wider mb-2 border-b border-gray-100 dark:border-gray-800 pb-1.5">
                {label}
            </p>
            <div className="space-y-2">
                <Row label="Study" value={formatVal(studyVal)} labelColor="text-[#47C4B7]" />
                <Row label="Coding" value={formatVal(codingVal)} labelColor="text-[#6366f1]" />
                <Row label="Watching" value={formatVal(watchingVal)} labelColor="text-[#f43f5e]" />
                <Row label="Countdown" value={formatVal(countdownVal)} labelColor="text-[#fbbf24]" />
                <Row label="Stopwatch" value={formatVal(stopwatchVal)} labelColor="text-[#8b5cf6]" />
                <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                    <Row label="Total" value={formatDisplayTime(totalVal)} labelColor="text-gray-900 dark:text-white" />
                </div>
            </div>
        </div>
    );
};

const EmptyChartState = ({ icon: Icon, title, message }) => (
    <div className="flex flex-col items-center justify-center h-[220px] text-center px-4">
        <div className="bg-gray-50/80 dark:bg-gray-800/50 p-3.5 rounded-2xl mb-3.5 border border-gray-200 dark:border-gray-700/50 shadow-sm">
            <Icon size={22} className="text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] font-bold text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-[11px] font-medium text-gray-400 max-w-[220px] leading-relaxed">{message}</p>
    </div>
);

export const AdminDashboard = () => {
    const { user } = useAuth();
    const defaultData = {
        totalUsers: 0,
        totalStudyHours: 0,
        totalCodingHours: 0,
        totalWatchingHours: 0,
        totalTasks: 0,
        totalActivities: 0,
        totalMaterials: 0,
        totalFeedback: 0,
        completionRate: 0,
        highestStreakUser: '',
        dailyStudyData: [],
        monthlyStudyData: [],
        yearlyStudyData: [],
        topUsers: []
    };
    const [data, setData] = useState(defaultData);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [timeframe, setTimeframe] = useState('7D'); // Overall Growth Momentum
    const [perfTimeframe, setPerfTimeframe] = useState('7D'); // Top Performance
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        type: 'All',
        topic: '',
        timeFilter: '7d', // Default to 7 days like Analytics
        sortBy: 'latest'
    });

    const filterOpts = [
        { id: '7d', label: 'Last 7 Days' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'yearly', label: 'Yearly' }
    ];

    const fetchData = useCallback(async (refresh = false) => {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            // Use local copy of filters to ensure we use what's in state during the call
            const res = await api.get('/admin/dashboard', { params: filters });
            setData(res.data);
            if (refresh) setRefreshKey(prev => prev + 1);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch admin data');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [filters]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData(true);
        setRefreshKey(prev => prev + 1);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 600);
    };

    // Initial load and background refresh
    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 5 * 60 * 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey === 0]); // Run once at start or when explicitly handled

    // Live Search & Filters Logic (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 600);
        return () => clearTimeout(timer);
    }, [filters.topic, filters.from, filters.to, filters.type, filters.timeFilter, filters.sortBy]);

    const handleTimePillClick = (id) => {
        const mapping = { '7d': '7D', 'monthly': '1M', 'yearly': '1Y' };
        setFilters(prev => ({ ...prev, timeFilter: id, from: '', to: '' }));
        if (mapping[id]) {
            setTimeframe(mapping[id]);
            setPerfTimeframe(mapping[id]);
        }
    };

    const performanceChartData = useMemo(() => {
        let base = [];
        if (!filters.timeFilter || perfTimeframe === '7D') base = data.dailyStudyData;
        else if (perfTimeframe === '1Y') base = data.yearlyStudyData;
        else base = data.monthlyStudyData;

        if (filters.sortBy === 'latest') return [...base].reverse();
        return base;
    }, [perfTimeframe, data, filters.sortBy, filters.timeFilter]);

    const growthChartData = useMemo(() => {
        let base = [];
        if (!filters.timeFilter || timeframe === '7D') base = data.dailyStudyData;
        else if (timeframe === '1Y') base = data.yearlyStudyData;
        else base = data.monthlyStudyData;

        if (filters.sortBy === 'latest') return [...base].reverse();
        return base;
    }, [timeframe, data, filters.sortBy, filters.timeFilter]);

    // Ensure we don't show a blank/broken dash if user isn't here yet
    if (!user) return <PageLoader />;
    
    return (
        <div className="space-y-6 sm:space-y-8 pb-10 max-w-full mx-auto px-0">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col gap-1.5 bg-transparent mb-6 w-full"
            >
                {/* Title row with refresh button inline */}
                <div className="flex items-center justify-between gap-2 w-full min-w-0">
                    <h1 className="text-lg sm:text-xl font-black text-gray-600 dark:text-gray-300 tracking-tight flex items-center gap-2 min-w-0">
                        <ShieldAlert className="text-[#47C4B7]/70 shrink-0" size={18} />
                        <span className="truncate">Admin Dashboard</span>
                    </h1>
                    <button
                        onClick={handleRefresh}
                        className={`shrink-0 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 hover:text-[#47C4B7] transition-all hover:shadow-md ${isRefreshing ? 'animate-spin cursor-not-allowed opacity-50' : ''}`}
                        title="Refresh Data"
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
                {/* Subtitle */}
                <p className="text-[13px] font-semibold italic text-gray-500 border-l-4 border-[#47C4B7] pl-3 pr-2 w-full break-words">
                    "Complete platform overview and real-time analytics engine."
                </p>
            </motion.div>

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
                                    placeholder="Search users, activities, tasks or materials..."
                                    value={filters.topic}
                                    onChange={(e) => setFilters(prev => ({ ...prev, topic: e.target.value }))}
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

            {/* Top Stat Cards Grid - 10 boxes, 5 cols on desktop, 2 on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3">
                {/* Row 1 */}
                <StatCard rKey={`users-${refreshKey}`} delay={0.05} label="Total Users" value={data.totalUsers} icon={Users} colorClass="text-indigo-500" />
                <StatCard rKey={`study-${refreshKey}`} delay={0.10} label="Study Time" value={formatDisplayTime(data.totalStudyHours)} icon={Clock} colorClass="text-[#47C4B7]" />
                <StatCard rKey={`coding-${refreshKey}`} delay={0.15} label="Coding" value={formatDisplayTime(data.totalCodingHours)} icon={Activity} colorClass="text-indigo-500" />
                <StatCard rKey={`watch-${refreshKey}`} delay={0.20} label="Watching" value={formatDisplayTime(data.totalWatchingHours)} icon={BarChart3} colorClass="text-rose-500" />
                
                {/* Completion (5th Box) */}
                <HoverCard
                    rKey={`progress-${refreshKey}`}
                    delay={0.25}
                    className="glass-card bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-1 xl:p-2.5 flex flex-col justify-center shadow-xl h-full min-h-[70px]"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-full bg-[#47C4B7]/10 flex items-center justify-center">
                                <CheckCircle2 size={18} className="text-[#47C4B7] shrink-0" strokeWidth={2.5} />
                            </div>
                            <p className="text-[clamp(11px,1.2vw,15px)] font-bold text-gray-500 dark:text-gray-400 truncate tracking-tight">Completion</p>
                        </div>
                        <h3 className="text-[clamp(10px,1.1vw,13px)] font-black text-[#47C4B7] leading-none tracking-tight">
                            {parseFloat(data.completionRate) % 1 === 0 ? parseInt(data.completionRate) : data.completionRate}%
                        </h3>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-1.5 md:mt-2 lg:mt-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${parseFloat(data.completionRate) || 0}%` }}
                            transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-[#47C4B7] to-emerald-400 rounded-full"
                        />
                    </div>
                </HoverCard>

                {/* Row 2 */}
                <StatCard rKey={`tasks-${refreshKey}`} delay={0.30} label="All Tasks" value={data.totalTasks} icon={CheckCircle2} colorClass="text-emerald-500" />
                <StatCard rKey={`activity-${refreshKey}`} delay={0.35} label="Activity Log" value={data.totalActivities} icon={Activity} colorClass="text-amber-500" />
                <StatCard rKey={`pdfs-${refreshKey}`} delay={0.40} label="Study Materials" value={data.totalMaterials} icon={FileText} colorClass="text-blue-500" />
                <StatCard rKey={`feedback-${refreshKey}`} delay={0.45} label="Feedback" value={data.totalFeedback} icon={BookOpen} colorClass="text-purple-500" />

                {/* Top Streak (10th Box) */}
                <HoverCard
                    rKey={`trophy-${refreshKey}`}
                    delay={0.50}
                    className="glass-card bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-1 xl:p-2.5 flex flex-col justify-center shadow-xl h-full min-h-[70px] relative overflow-hidden group"
                    extraHover={{ borderColor: 'rgba(249, 115, 22, 0.6)', boxShadow: '0 20px 40px -8px rgba(249, 115, 22, 0.22)' }}
                >
                    <div className="absolute -right-2 -top-2 opacity-5 blur-lg w-16 h-16 bg-orange-500 rounded-full" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Trophy size={18} className="text-orange-500 shrink-0" strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <p className="text-[clamp(11px,1.2vw,15px)] font-bold text-gray-500 dark:text-gray-400 truncate tracking-tight mb-0.5">Top Streak</p>
                                <h3 className="text-[clamp(10px,1.1vw,13px)] font-black text-gray-600 dark:text-gray-400 leading-none tracking-tight truncate">
                                    {data.highestStreakUser.split('(')[0].trim()}
                                </h3>
                            </div>
                        </div>
                        {data.highestStreakUser.includes('(') && (
                            <span className="text-[9px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded shrink-0">
                                {data.highestStreakUser.split('(')[1].split(' ')[0]}d
                            </span>
                        )}
                    </div>
                </HoverCard>
            </div>

            {/* ── Charts (responsive) ───────────────────────────────────── */}
            <div className="flex flex-col gap-6 sm:gap-8">

                {/* 1. Study Hours Breakdown (Replaced Top Performance) */}
                <motion.div
                    key={`performance-${refreshKey}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className="glass-card bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] p-4 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-[#47C4B7]/50 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl"
                >
                    <div className="flex flex-col xs:flex-row sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 min-w-0 flex-1 w-full">
                            <Clock size={16} className="text-[#47C4B7] shrink-0" />
                            <h2 className="text-sm font-extrabold text-gray-600 dark:text-gray-400 tracking-tight whitespace-nowrap">Top Performance</h2>
                            <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800 ml-2 hidden sm:block" />
                        </div>
                    </div>

                    <div className="h-52 sm:h-64 md:h-72">
                        {performanceChartData.some(d => (d.hours || 0) > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceChartData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" strokeOpacity={0.4} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={4}
                                        tickFormatter={(v) => /^\d{4}$/.test(String(v)) ? String(v) : String(v).slice(0, 3)}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                                        axisLine={false}
                                        tickLine={false}
                                        domain={[0, 'auto']}
                                        allowDecimals={true}
                                        tickFormatter={(v) => `${v}h`}
                                        width={36}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 196, 183, 0.05)' }} />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        content={({ payload }) => (
                                            <div className="flex flex-wrap justify-center gap-1 sm:gap-4 mt-1 sm:mt-1">
                                                {[
                                                    { label: 'Study', color: TEAL },
                                                    { label: 'Coding', color: INDIGO },
                                                    { label: 'Watching', color: ROSE },
                                                    { label: 'Countdown', color: AMBER },
                                                    { label: 'Stopwatch', color: PURPLE }
                                                ].map((entry, index) => (
                                                    <div key={`item-${index}`} className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-gray-50 dark:bg-gray-800 rounded-md sm:rounded-lg border border-gray-100 dark:border-gray-700">
                                                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                                        <span className="text-[8px] sm:text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tighter">{entry.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    />
                                    <Bar dataKey="study" name="Study" stackId="a" fill={TEAL} barSize={isMobile ? 18 : 40} />
                                    <Bar dataKey="coding" name="Coding" stackId="a" fill={INDIGO} barSize={isMobile ? 18 : 40} />
                                    <Bar dataKey="watching" name="Watching" stackId="a" fill={ROSE} barSize={isMobile ? 18 : 40} />
                                    <Bar dataKey="countdown" name="Countdown" stackId="a" fill={AMBER} barSize={isMobile ? 18 : 40} />
                                    <Bar dataKey="stopwatch" name="Stopwatch" stackId="a" fill={PURPLE} radius={[8, 8, 0, 0]} barSize={isMobile ? 18 : 40} />
                                </BarChart>
                            </ResponsiveContainer>
                            ) : (
                                <EmptyChartState
                                    icon={Clock}
                                    title="No study hours"
                                    message="Keep track of every breakthrough. Your learning hours will appear here as soon as you start your first session."
                                />
                            )}
                    </div>
                </motion.div>

                {/* 2. Growth Engine - Timeframe Switching */}
                <motion.div
                    key={`growth-${refreshKey}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7, ease: [0.23, 1, 0.32, 1] }}
                    className="glass-card bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] p-4 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-[#47C4B7]/50 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl"
                >
                    {/* Header row – stacks on very small screens */}
                    <div className="flex flex-col xs:flex-row sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 min-w-0 flex-1 w-full">
                            <TrendingUp size={16} className="text-[#47C4B7] shrink-0" />
                            <h2 className="text-sm font-extrabold text-gray-600 dark:text-gray-400 tracking-tight whitespace-nowrap">Overall Growth Momentum</h2>
                            <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800 ml-2 hidden sm:block" />
                        </div>
                    </div>

                    <div className="h-52 sm:h-64 md:h-72">
                        {growthChartData.some(d => (d.hours || 0) > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthChartData}>
                                    <defs>
                                        <linearGradient id="colorAdminTrend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={TEAL} stopOpacity={0.4} />
                                            <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" strokeOpacity={0.4} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} tickFormatter={(v) => /^\d{4}$/.test(String(v)) ? String(v) : String(v).slice(0, 3)} />
                                    <YAxis tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} width={36} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="hours"
                                        name="Study Progress"
                                        stroke={TEAL}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAdminTrend)"
                                        activeDot={{ r: 6, fill: TEAL, stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChartState 
                                icon={TrendingUp} 
                                title="No growth data" 
                                message="Visualize your progress. Your performance trends will build as you complete more study milestones." 
                            />
                        )}
                    </div>
                </motion.div>
            </div>


        </div>
    );
};

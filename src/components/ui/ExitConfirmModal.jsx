import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';

export const ExitConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-6"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 w-[85%] max-w-[250px] sm:max-w-[270px] md:max-w-[290px] shadow-2xl text-center border-2 border-gray-100 dark:border-gray-800 relative overflow-hidden"
                >
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#47C4B7]/5 blur-2xl rounded-full -z-10 translate-x-1/2 -translate-y-1/2" />

                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-50 dark:bg-rose-900/10 rounded-xl flex items-center justify-center text-rose-500 mx-auto mb-3 border border-rose-100 dark:border-rose-900/20">
                        <LogOut size={18} className="sm:size-20" />
                    </div>

                    <h2 className="text-[13px] sm:text-[14px] md:text-[15px] font-extrabold text-gray-700 dark:text-gray-300 tracking-tight mb-1.5 sm:mb-2 text-center">
                        Do you want to exit?
                    </h2>
                    
                    <p className="text-[10px] sm:text-[11px] md:text-[12px] font-medium text-gray-400 dark:text-gray-500 mb-5 sm:mb-6 px-1 sm:px-2 leading-relaxed text-center">
                        Are you sure you want to leave StudyHub?
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2 sm:py-2.5 text-[11px] sm:text-[12px] md:text-[13px] font-bold bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition active:scale-95 border border-transparent"
                        >
                            No
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2 sm:py-2.5 text-[11px] sm:text-[12px] md:text-[13px] font-bold bg-[#47C4B7] text-white rounded-lg hover:bg-[#3db3a6] shadow-md shadow-[#47C4B7]/10 transition active:scale-95"
                        >
                            Yes
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

import { motion, AnimatePresence } from 'framer-motion';
import { MemeCard } from './MemeCard';
import type { BirdeyeMemeToken } from '@/types/birdeye';

interface MemeFeedProps {
    items: BirdeyeMemeToken[];
    isLoading?: boolean;
    emptyMessage?: string;
}

export const MemeFeed = ({ items, isLoading, emptyMessage = 'No tokens found' }: MemeFeedProps) => {
    if (isLoading && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--text-muted)] border-t-[var(--accent-meme)] animate-spin" />
                <p className="text-xs text-[var(--text-muted)]">Loading meme tokens...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-xs text-[var(--text-muted)]">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col overflow-y-auto max-h-[480px] pr-0.5">
            <AnimatePresence initial={false}>
                {items.map((token, i) => (
                    <motion.div
                        key={token.address}
                        layout
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{ duration: 0.18 }}
                    >
                        <MemeCard token={token} index={i} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

'use client';

import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bookmark, LogOut, Plus, Trash2, ExternalLink, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookmarkType {
    id: string;
    url: string;
    title: string;
    created_at: string;
}

export default function DashboardPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
    const [newUrl, setNewUrl] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session.user);
            fetchBookmarks();
        };

        getUser();

        // Realtime subscription
        const channel = supabase
            .channel('bookmarks_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                },
                (payload) => {
                    console.log('Realtime change received:', payload);
                    fetchBookmarks();
                }
            )
            .subscribe((status) => {
                console.log('Realtime subscription status:', status);
            });

        return () => {
            supabase.removeChannel(channel);
        };

    }, [supabase, router]);

    const fetchBookmarks = async () => {
        const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setBookmarks(data);
        }
        setLoading(false);
    };

    const handleAddBookmark = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl || !newTitle) return;

        setAdding(true);
        const { data, error } = await supabase.from('bookmarks').insert([
            {
                url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
                title: newTitle,
                user_id: user?.id,
            },
        ]).select();

        if (!error) {
            setNewUrl('');
            setNewTitle('');
            // Manually fetch to ensure immediate update in the current tab
            fetchBookmarks();
        } else {
            console.error('Error adding bookmark:', error);
            alert(error.message);
        }
        setAdding(false);
    };


    const handleDeleteBookmark = async (id: string) => {
        await supabase.from('bookmarks').delete().eq('id', id);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const filteredBookmarks = bookmarks.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Bookmark className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Smart Bookmark</h1>
                            <p className="text-neutral-500 text-sm">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="p-3 hover:bg-white/5 rounded-xl transition-colors text-neutral-400 hover:text-white"
                        title="Sign Out"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </header>

                {/* Add Form */}
                <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-12">
                    <form onSubmit={handleAddBookmark} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-5">
                            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-2 ml-1">Title</label>
                            <input
                                type="text"
                                placeholder="Work Projects"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                required
                            />
                        </div>
                        <div className="md:col-span-5">
                            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-2 ml-1">URL</label>
                            <input
                                type="text"
                                placeholder="github.com/example"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                required
                            />
                        </div>
                        <div className="md:col-span-2 flex items-end">
                            <button
                                type="submit"
                                disabled={adding}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                {adding ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Plus className="w-5 h-5" />}
                                Add
                            </button>
                        </div>
                    </form>
                </section>

                {/* Search & List */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search bookmarks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredBookmarks.map((bookmark) => (
                            <motion.div
                                key={bookmark.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative bg-white/5 hover:bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                        <Bookmark className="w-5 h-5" />
                                    </div>
                                    <button
                                        onClick={() => handleDeleteBookmark(bookmark.id)}
                                        className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg mb-1 truncate">{bookmark.title}</h3>
                                <p className="text-neutral-500 text-sm truncate mb-6">{bookmark.url}</p>
                                <a
                                    href={bookmark.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-400 text-sm font-semibold hover:underline"
                                >
                                    Visit Link
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredBookmarks.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl mt-12">
                        <p className="text-neutral-500">No bookmarks found. Start by adding one above!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

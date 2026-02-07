import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketContext from '../../context/TicketContext';
import ticketService from '../../services/ticketService';
import { CATEGORIES, PRIORITIES } from '../../utils/constants';

const CreateTicket = () => {
    const { createTicket, isLoading } = useContext(TicketContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'General Query',
        priority: 'Low'
    });
    const [files, setFiles] = useState([]);
    const [isPredicting, setIsPredicting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // For debouncing title prediction
    const debounceTimer = useRef(null);

    const { title, description, category, priority } = formData;

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        // Trigger AI prediction if title changes
        if (name === 'title' && value.length > 5) {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                handlePredictDetails(value);
            }, 1000);
        }
    };

    const handlePredictDetails = async (titleValue) => {
        setIsPredicting(true);
        try {
            const prediction = await ticketService.predictTicketDetails(titleValue);
            setFormData(prev => ({
                ...prev,
                priority: prediction.priority,
                category: prediction.category
            }));
        } catch (error) {
            console.error('Prediction failed:', error);
        } finally {
            setIsPredicting(false);
        }
    };

    const handleGenerateDescription = async () => {
        if (!title.trim() || title.length < 5) {
            alert('Please enter a more descriptive title first');
            return;
        }

        setIsGenerating(true);
        try {
            const generatedDesc = await ticketService.generateDescription(title);
            setFormData(prev => ({
                ...prev,
                description: generatedDesc
            }));
        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const onFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const ticketFormData = new FormData();
        ticketFormData.append('title', title);
        ticketFormData.append('description', description);
        ticketFormData.append('category', category);
        ticketFormData.append('priority', priority);

        files.forEach((file) => {
            ticketFormData.append('attachments', file);
        });

        try {
            await createTicket(ticketFormData);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Failed to create ticket');
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mb-8 transition-colors group"
            >
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </div>
                <span className="font-medium text-sm">Cancel & Return</span>
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Create New Support Request</h1>
                        <p className="text-gray-500 font-medium tracking-tight">Our AI will analyze your ticket for faster resolution.</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* Title Input */}
                        <div>
                            <div className="flex justify-between items-center mb-3 ml-1">
                                <label className="block text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Subject / Issue Title (AI Predictive)</label>
                                {isPredicting ? (
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 animate-pulse">
                                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        AI ANALYZING...
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">AI Ready</span>
                                )}
                            </div>
                            <input
                                type="text"
                                name="title"
                                value={title}
                                onChange={onChange}
                                placeholder="e.g. Can't access mijn account billing"
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none dark:text-white font-medium shadow-inner"
                                required
                            />
                        </div>

                        {/* Metadata Row - AI Assisted & User Controlled */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/20 dark:bg-blue-900/5 rounded-3xl border border-blue-100/50 dark:border-blue-900/20">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Contextual Category</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={category}
                                        onChange={onChange}
                                        className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none dark:text-white font-medium cursor-pointer appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                    >
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-500 text-[8px] font-bold text-white rounded-full uppercase tracking-tighter shadow-sm">AI Suggested</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Urgency Level (AI Set)</label>
                                <div className="flex items-center gap-3 p-4 bg-gray-100/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-inner cursor-not-allowed group">
                                    <div className={`p-2 rounded-lg ${priority === 'High' ? 'bg-red-100 dark:bg-red-900/50' :
                                        priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                                            'bg-green-100 dark:bg-green-900/50'
                                        }`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${priority === 'High' ? 'text-red-600' :
                                            priority === 'Medium' ? 'text-yellow-600' :
                                                'text-green-600'
                                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{priority}</span>
                                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-500 rounded uppercase">Locked</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium">Determined by Priority Engine</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <div className="flex justify-between items-center mb-3 ml-1">
                                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Problem Description</label>
                                <button
                                    type="button"
                                    onClick={handleGenerateDescription}
                                    disabled={isGenerating || !title.trim() || title.length < 5}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-[10px] font-black hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-20 uppercase tracking-widest group active:scale-95"
                                >
                                    {isGenerating ? (
                                        <>
                                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            AI Drafting...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Draft with AI
                                        </>
                                    )}
                                </button>
                            </div>
                            <textarea
                                name="description"
                                value={description}
                                onChange={onChange}
                                placeholder="Describe your issue or use our AI magic draft for a professional description..."
                                className={`w-full p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none dark:text-white text-sm min-h-[220px] leading-relaxed shadow-inner ${isGenerating ? 'animate-pulse ring-4 ring-purple-500/20' : ''}`}
                                required
                            />
                            {isGenerating && (
                                <p className="mt-2 text-center text-[10px] text-purple-600 dark:text-purple-400 font-bold animate-pulse uppercase tracking-widest">🪄 Working our AI magic based on your title...</p>
                            )}
                        </div>

                        {/* File Upload Area */}
                        <div className="bg-gray-50/50 dark:bg-gray-900/30 p-6 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700 group hover:border-blue-300 dark:hover:border-blue-900 transition-colors">
                            <label className="flex flex-col items-center justify-center cursor-pointer">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                    {files.length > 0 ? `${files.length} Files Selected` : 'Click or Drag Files here'}
                                </span>
                                <span className="text-xs text-gray-400">Attach screenshots, logs, or documents (Max 5)</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={onFileChange}
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                                />
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={isLoading || isGenerating}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-blue-500/50 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Transmitting...
                                    </>
                                ) : (
                                    <>
                                        🚀 Launch Support Ticket
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/tickets')}
                                className="px-10 py-5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Abort
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTicket;

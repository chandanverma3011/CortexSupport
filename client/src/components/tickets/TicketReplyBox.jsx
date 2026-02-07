import { useState } from 'react';

const TicketReplyBox = ({ ticketId }) => { // In real app, would take a submit function
    const [content, setContent] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        // Simulate submission
        console.log(`Submitting reply for ticket ${ticketId}: ${content}`);
        setContent('');
        // You would call a service/context function here
    };

    return (
        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-2">Add Reply</h3>
            <form onSubmit={onSubmit}>
                <textarea
                    className="input-field min-h-[100px] mb-2"
                    placeholder="Type your reply here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                    <button type="submit" className="btn-primary">Send Reply</button>
                </div>
            </form>
        </div>
    );
};

export default TicketReplyBox;

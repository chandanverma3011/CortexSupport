const TicketStatusBadge = ({ status }) => {
    let colorClass = 'bg-gray-100 text-gray-600 border-gray-200';

    switch (status) {
        case 'Open':
            colorClass = 'bg-blue-50 text-blue-600 border-blue-100';
            break;
        case 'In Progress':
            colorClass = 'bg-amber-50 text-amber-600 border-amber-100';
            break;
        case 'Closed':
            colorClass = 'bg-slate-100 text-slate-500 border-slate-200';
            break;
        case 'Resolved':
            colorClass = 'bg-emerald-50 text-emerald-600 border-emerald-100';
            break;
        default:
            break;
    }

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
            {status}
        </span>
    );
};

export default TicketStatusBadge;

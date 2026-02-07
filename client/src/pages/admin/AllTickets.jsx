import TicketTable from '../../components/tickets/TicketTable';

const AllTickets = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">All Support Tickets</h1>
            <TicketTable />
        </div>
    );
};

export default AllTickets;

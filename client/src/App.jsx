import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import AgentRoute from './components/common/AgentRoute';
import HomeDispatcher from './components/common/HomeDispatcher';
import Navbar from './components/common/Navbar';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import AgentLayout from './components/layout/AgentLayout';
import UserLayout from './components/layout/UserLayout';

const PublicLayout = () => (
  <>
    <Navbar />
    <div className="container mx-auto px-4 py-8">
      <Outlet />
    </div>
  </>
);

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import MyTickets from './pages/user/MyTickets';
import CreateTicket from './pages/user/CreateTicket';
import TicketDetails from './pages/user/TicketDetails';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AllTickets from './pages/admin/AllTickets';
import Analytics from './pages/admin/Analytics';
import UserManagement from './pages/admin/UserManagement';

// Agent pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentTickets from './pages/agent/AgentTickets';
import AgentTicketDetail from './pages/agent/AgentTicketDetail';

// Other
import Profile from './pages/common/Profile';
import Settings from './pages/common/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 font-sans">
      <Routes>
        {/* Public Routes - Use Navbar */}
        <Route element={<PublicLayout />}>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Route>

        {/* Protection Layer */}
        <Route element={<ProtectedRoute />}>
          {/* Landing / Dispatcher */}
          <Route path='/' element={<HomeDispatcher />} />

          {/* User Routes */}
          <Route element={<UserLayout />}>
            <Route path='/dashboard' element={<UserDashboard />} />
            <Route path='/tickets' element={<MyTickets />} />
            <Route path='/create-ticket' element={<CreateTicket />} />
            <Route path='/ticket/:ticketId' element={<TicketDetails />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/settings' element={<Settings />} />
          </Route>

          {/* Agent Routes */}
          <Route element={<AgentRoute />}>
            <Route element={<AgentLayout />}>
              <Route path='/agent' element={<AgentDashboard />} />
              <Route path='/agent/tickets' element={<AgentTickets />} />
              <Route path='/agent/ticket/:ticketId' element={<AgentTicketDetail />} />
              <Route path='/agent/profile' element={<Profile />} />
              <Route path='/agent/settings' element={<Settings />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path='/admin' element={<AdminDashboard />} />
              <Route path='/admin/tickets' element={<AllTickets />} />
              <Route path='/admin/analytics' element={<Analytics />} />
              <Route path='/admin/users' element={<UserManagement />} />
              <Route path='/admin/profile' element={<Profile />} />
              <Route path='/admin/settings' element={<Settings />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;

import { Suspense } from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ListingsPage from '../pages/Listings/ListingsPage';
import ListingDetail from '../pages/Listings/ListingDetail';
import DashboardPage from '../pages/Dashboard/DashboardPage';

// Placeholder components - these will be replaced with real page imports later
import ChatPage from '../pages/Chat/ChatPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import PaymentsPage from '../pages/Payments/PaymentsPage';
const NotFound = () => <div className="p-4"><h1>404 Not Found</h1></div>;

// Loading component
const Loading = () => <div className="p-4">Loading...</div>;

export const AppRoutes = () => {
    const element = useRoutes([
        {
            path: '/auth',
            element: <PublicRoute />,
            children: [
                { path: 'login', element: <Login /> },
                { path: 'register', element: <Register /> },
                { path: '', element: <Navigate to="login" replace /> }
            ]
        },
        {
            path: '/',
            element: <ProtectedRoute />,
            children: [
                { path: 'dashboard', element: <DashboardPage /> },
                { path: 'listings', element: <ListingsPage /> },
                { path: 'listings/:id', element: <ListingDetail /> },
                { path: 'chat', element: <ChatPage /> },
                { path: 'profile', element: <ProfilePage /> },
                { path: 'payments', element: <PaymentsPage /> },
                { path: '', element: <Navigate to="dashboard" replace /> }
            ]
        },
        {
            path: '*',
            element: <NotFound />
        }
    ]);

    return (
        <Suspense fallback={<Loading />}>
            {element}
        </Suspense>
    );
};

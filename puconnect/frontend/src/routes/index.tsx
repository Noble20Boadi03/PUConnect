import { Suspense } from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ListingsPage from '../pages/Listings/ListingsPage';
import ListingDetail from '../pages/Listings/ListingDetail';

// Placeholder components - these will be replaced with real page imports later
const Dashboard = () => <div className="p-4"><h1>Dashboard</h1></div>;
const Chat = () => <div className="p-4"><h1>Chat</h1></div>;
const Profile = () => <div className="p-4"><h1>Profile</h1></div>;
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
                { path: 'dashboard', element: <Dashboard /> },
                { path: 'listings', element: <ListingsPage /> },
                { path: 'listings/:id', element: <ListingDetail /> },
                { path: 'chat', element: <Chat /> },
                { path: 'profile', element: <Profile /> },
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

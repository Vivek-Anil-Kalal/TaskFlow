import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setTheme } from './store/themeSlice';
import { Toaster } from 'react-hot-toast';

// Placeholder Pages (will be implemented next)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskDetails from './pages/TaskDetails';
import Teams from './pages/Teams';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import MyTasks from './pages/MyTasks';

// Layout
import Layout from './components/layout/Layout';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminManagerRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'developer') return <Navigate to="/my-tasks" />;
    return children;
};

function App() {
    const dispatch = useDispatch();
    const { theme } = useSelector((state) => state.theme);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Initial theme check
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            dispatch(setTheme(storedTheme));
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            dispatch(setTheme('dark'));
        }
    }, [dispatch]);

    return (
        <Router>
            <div><Toaster /></div>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/" element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }>
                    <Route index element={<AdminManagerRoute><Dashboard /></AdminManagerRoute>} />
                    <Route path="tasks" element={<TaskList />} />
                    <Route path="tasks/:id" element={<TaskDetails />} />
                    <Route path="my-tasks" element={<MyTasks />} />
                    <Route path="teams" element={<Teams />} />
                    <Route path="profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;

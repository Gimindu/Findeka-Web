import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingPage from './lib/startingPage/loadingPage';
// import LostFoundAI from './lib/copy/Fullcode';
import AuthPage from './pages/auth/AuthPage';
import Dashboard from './pages/dashboard/DashboardPage';
import ReportItemPage from './pages/report/ReportItemPage';
import ItemDetailsPage from './pages/item/ItemDetailsPage';
// import LostFoundAI2 from './lib/copy/change_code';
import Chat from './pages/chat/ChatPage';
import Profile from './pages/profile/ProfilePage';
import Leaderboard from './pages/leaderboard/LeaderboardPage';

import SettingPage from './pages/settings/SettingsPage';
import NotificationPage from './pages/notifications/NotificationPage';
import SearchPage from './pages/search/SearchPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/item/:id" element={<ItemDetailsPage />} />
        <Route path="/report-item" element={<ReportItemPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={ <Profile/>} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        <Route path="/notifications" element={<NotificationPage />} />
        {/* <Route path="/add-post" element={<Sidebar />} /> */}

        
        {/* Add more routes as needed */}

        {/* Add more routes as needed */}
        <Route path="/search" element={<SearchPage />} />

        {/* <Route path="/1" element={<LostFoundAI />} /> */}


      </Routes>
    </Router>
  );
}

export default App;

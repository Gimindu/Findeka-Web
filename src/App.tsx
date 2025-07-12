import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingPage from './lib/startingPage/loadingPage';
import LostFoundAI from './lib/copy/Fullcode';
import AuthPage from './lib/startingPage/LoginPage';
import Dashboard from './lib/Dashboard';
import ReportItemPage from './lib/ReportItemPage';
import LostFoundAI2 from './lib/copy/change_code';
import Chat from './lib/Chat';
import QRCode from './lib/QrCode';
import Profile from './lib/Profile';
import Leaderboard from './lib/LeaderBoard';
import Analytics from './lib/Analytics';
import PostItemModal from './lib/AddPost';
import SettingPage from './lib/Setting';
import NotificationPage from './lib/Notification';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report-item" element={<ReportItemPage />} />
        <Route path="/1" element={<LostFoundAI />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/qr_code" element={<QRCode />} />
        <Route path="/profile" element={ <Profile/>} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/add-post" element={<PostItemModal />} />
        <Route path="/notifications" element={<NotificationPage notifications={[]} />} />
        {/* <Route path="/add-post" element={<Sidebar />} /> */}

        
        {/* Add more routes as needed */}

        <Route path="/2" element={<LostFoundAI2 />} />

      </Routes>
    </Router>
  );
}

export default App;

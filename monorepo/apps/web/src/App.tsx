import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingPage from './lib/startingPage/loadingPage';
// import LostFoundAI from './lib/copy/Fullcode';
import AuthPage from './pages/auth/AuthPage';
import Dashboard from './pages/dashboard/DashboardPage';
import ReportItemPage from './pages/report/ReportItemPage';
// import LostFoundAI2 from './lib/copy/change_code';
import Chat from './pages/chat/ChatPage';
import Profile from './lib/Profile';
import Leaderboard from './lib/LeaderBoard';
import PostItemModal from './lib/AddPost';
import SettingPage from './lib/Setting';
import NotificationPage from './lib/Notification';
import ImageMatchingDemo from './lib/Cnn_module';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report-item" element={<ReportItemPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={ <Profile/>} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/add-post" element={<PostItemModal />} />
        <Route path="/notifications" element={<NotificationPage notifications={[]} />} />
        {/* <Route path="/add-post" element={<Sidebar />} /> */}

        
        {/* Add more routes as needed */}

        {/* Add more routes as needed */}
        <Route path="/3" element={<ImageMatchingDemo />} />

        {/* <Route path="/1" element={<LostFoundAI />} /> */}


      </Routes>
    </Router>
  );
}

export default App;

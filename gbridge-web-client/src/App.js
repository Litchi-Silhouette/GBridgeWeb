import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AxiosProvider } from './utils/AxiosContext';
import WelcomeInterface from './screens/WelcomeInterface';
import Home from './screens/Home';
import UserRequests from './screens/UserRequests';
import MarketComponent from './screens/MarketComponent';
import ScoreInterface from './screens/ScoreInterface';
import PersonalInfo from './screens/PersonalInfo';
import { BotChatInterface, AdviserChatInterface } from './screens/ChatInterface';

const App = () => {
  return (
    <AxiosProvider>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomeInterface />} />
          <Route path="/home" element={<Home />} />
          <Route path="/userRequest" element={<UserRequests />} />
          <Route path="/market" element={<MarketComponent />} />
          <Route path="/score" element={<ScoreInterface />} />
          <Route path="/personalInfo" element={<PersonalInfo />} />
          <Route path="/botChat" element={<BotChatInterface />} />
          <Route path="/adviserChat" element={<AdviserChatInterface />} />
        </Routes>
      </Router>
    </AxiosProvider>
  );
};

export default App;

// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginInterface from './screens/LoginInterface';
import Home from './screens/Home';
import Dummy from './utils/dummy';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginInterface />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dummy" element={<Dummy target="/home" />} />
      </Routes>
    </Router>
  );
};

export default App;

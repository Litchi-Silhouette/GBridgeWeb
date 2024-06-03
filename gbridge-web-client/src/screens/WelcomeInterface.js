// src/screens/WelcomeInterface.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SingleButton } from '../components/MyButton';
import TextAnimation from '../components/TextAnimation';
import LoginInterface from '../components/LoginInterface';
import RegisterInterface from '../components/RegisterInterface';
import './WelcomeInterface.css';

const WelcomeInterface = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('welcome'); // 'welcome', 'login', or 'register'
    const handleLoginPress = () => {
        setView('login');
    };

    const handleRegisterPress = () => {
        setView('register');
    };

    const handleAdviser = () => {
        navigate('/adviser', { replace: true });
    };

    const handleBack = () => {
        setView('welcome');
    }

    return (
        <>
            <div className="background"></div>
            <div className="welcome-container">
                <div className='content'>
                    <div className="left-container">
                        <TextAnimation lines={["GBridge", "your reliable", "P2P platform !"]} />
                        {view !== 'welcome' && <SingleButton title="Back" onPress={handleBack} />}
                    </div>
                    <div className="right-container">
                        {view === 'welcome' && (
                            <>
                                <SingleButton title="Login" onPress={handleLoginPress} />
                                <SingleButton title="Register" onPress={handleRegisterPress} />
                                <SingleButton title="Continue as Adviser" onPress={handleAdviser} />
                            </>
                        )}
                        {view === 'login' && <LoginInterface />}
                        {view === 'register' && <RegisterInterface />}
                    </div>
                </div>
            </div>
        </>
    );
};

export default WelcomeInterface;
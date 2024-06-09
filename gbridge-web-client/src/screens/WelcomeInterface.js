import React, { useState } from 'react';
import { SingleButton } from '../components/MyButton';
import TextAnimation from '../components/TextAnimation';
import LoginInterface from '../components/LoginInterface';
import RegisterInterface from '../components/RegisterInterface';
import './WelcomeInterface.css';

const WelcomeInterface = () => {
    const [view, setView] = useState('welcome'); // 'welcome', 'login', or 'register'
    const handleLoginPress = () => {
        setView('login');
    };

    const handleRegisterPress = () => {
        setView('register');
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
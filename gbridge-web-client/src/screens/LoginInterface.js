// src/screens/LoginInterface.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginRequest, loginSuccess, loginFailure, toggleSaveAccount } from '../store/authSlice';
import axios from 'axios';
import DefaultUserIcon from '../assets/default_user_icon.png';
import './LoginInterface.css';
import { SingleButton } from '../components/MyButton';
import { EmailInput, VerificationCodeInput } from '../components/InfoInputs';
import Spinner from '../components/Spinner';

const LoginInterface = () => {
  const [activeTab, setActiveTab] = useState('username'); // Can be 'email' or 'username'
  const [activeVerification, setActiveVerification] = useState('password');
  const [emailName, setEmailName] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const { isLoading, error, saveAccount } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    let email = `${emailName}@${emailDomain}`;
    let type = '';

    if (activeTab === 'email' && activeVerification === 'verification code' && email && verificationCode) {
      type = 'email_verificationcode';
    } else if (activeTab === 'email' && activeVerification === 'password' && email && password) {
      type = 'email_password';
    } else if (activeTab === 'username' && activeVerification === 'verification code' && username && verificationCode) {
      type = 'username_verificationcode';
    } else if (activeTab === 'username' && activeVerification === 'password' && username && password) {
      type = 'username_password';
    }

    if (type !== '') {
      dispatch(loginRequest());

      try {
        const response = await axios.post('http://localhost:3000/api/login', {
          type: 'login',
          content: {
            email,
            password,
            verificationcode: verificationCode,
            username,
            login_type: type,
          },
          extra: null,
        });

        if (response.data.success) {
          dispatch(loginSuccess(response.data.user));
          navigate('/dummy?target=/home', { replace: true });
        } else {
          dispatch(loginFailure('Invalid credentials'));
        }
      } catch (error) {
        dispatch(loginFailure('Login failed. Please try again.'));
      }
    } else {
      alert(`Please enter both ${activeTab} and ${activeVerification}`);
    }
  };

  const sendVerificationCode = async () => {
    let email = `${emailName}@${emailDomain}`;
    let content = {};

    if (activeTab === 'email') {
      content.email = email;
    } else {
      content.username = username;
    }

    if ((email && activeTab === 'email') || (username && activeTab === 'username')) {
      dispatch(loginRequest());

      try {
        const response = await axios.post('http://localhost:3000/api/send_verification_code', {
          type: 'get_verificationcode',
          content,
          extra: null,
        });

        if (response.data.success) {
          setIsCodeSent(true);
          alert('Verification code sent. Please check your mailbox.');
        } else {
          dispatch(loginFailure('Failed to send verification code. Please try again.'));
        }
      } catch (error) {
        dispatch(loginFailure('Failed to send verification code. Please try again.'));
      }
    } else {
      alert(`Please enter your ${activeTab}`);
    }
  };

  return (
    <div className="container">
      <img src={DefaultUserIcon} alt="User Icon" className="icon" />
      <div className="tab-container">
        <button
          className={`tab ${activeTab === 'username' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('username')}
        >
          Username
        </button>
        <button
          className={`tab ${activeTab === 'email' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          Email
        </button>
      </div>

      {activeTab === 'email' ? (
        <EmailInput
          emailName={emailName}
          emailDomain={emailDomain}
          onNameChange={setEmailName}
          onDomainChange={setEmailDomain}
          editable={!isLoading || !isCodeSent}
        />
      ) : (
        <input
          className="input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
      )}

      {activeVerification === 'verification code' ? (
        <>
          <VerificationCodeInput
            onSendCode={sendVerificationCode}
            onCodeChange={setVerificationCode}
            disabled={isLoading || isCodeSent}
          />
          <button className="link-button" onClick={() => setActiveVerification('password')}>
            Login with Password
          </button>
        </>
      ) : (
        <>
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <button className="link-button" onClick={() => setActiveVerification('verification code')}>
            Login with Verification Code
          </button>
        </>
      )}

      <div className="checkbox-container">
        <input
          type="checkbox"
          id="customCheckbox"
          checked={saveAccount}
          onChange={() => dispatch(toggleSaveAccount())}
        />
        <label htmlFor="customCheckbox" className="label">Save Account</label>
      </div>
      <SingleButton title="Login" onPress={handleLogin} disable={isLoading} />
      {isLoading && <Spinner size="small" color="#0000ff" />}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default LoginInterface;

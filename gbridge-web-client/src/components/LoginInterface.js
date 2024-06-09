// src/screens/LoginInterface.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  loginRequest, loginSuccess, loginFailure,
  sendCodeFailure, sendCodeRequest, sendCodeSuccess, reset
} from '../store/authSlice';
import { setPortrait, setCredentials, setAuthenticated, setSaveAccount, toggleSaveAccount } from '../store/globalSlice';
import { useAxios } from '../utils/AxiosContext';
import DefaultUserIcon from '../assets/default_user_icon.png';
import config from '../config/config.json';
import styles from './LoginInterface.module.css';
import { SingleButton } from './MyButton';
import { EmailInput, VerificationCodeInput } from './InfoInputs';
import Spinner from './Spinner';
import { saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage } from '../utils/localStorageUtils';

const LoginInterface = () => {
  const [activeTab, setActiveTab] = useState('username'); // Can be 'email' or 'username'
  const [activeVerification, setActiveVerification] = useState('password');
  const [emailName, setEmailName] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const { isLoading, error, isCodeSent } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { portrait, saveAccount } = useSelector((state) => state.global);
  const axios = useAxios();

  useEffect(() => {
    const saveAccount = getFromLocalStorage('saveAccount');
    dispatch(setSaveAccount(saveAccount));

    if (saveAccount) {
      const username = getFromLocalStorage('username');
      const password = getFromLocalStorage('password');
      const portrait = getFromLocalStorage('portrait');
      dispatch(setCredentials({ username, password }));
      dispatch(setPortrait(portrait));
      setPassword(password);
      setUsername(username);
    }

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // get basic user info
  const updateUserInfo = async () => {
    try {
      const response = await axios.post(config.proxy.common, {
        type: "get_user_info",
        content: [
          "portrait",
          "username",
          "password",
          "authenticated"
        ],
        extra: null
      });

      if (response.data.success) {
        const { portrait, username, password, authenticated } = response.data.content;
        dispatch(setPortrait(portrait));
        dispatch(setCredentials({ username, password }));
        dispatch(setAuthenticated(authenticated));
        saveToLocalStorage('saveAccount', saveAccount);

        if (saveAccount) {
          saveToLocalStorage('username', username);
          saveToLocalStorage('password', password);
          saveToLocalStorage('portrait', portrait);
        }
        else {
          removeFromLocalStorage('username');
          removeFromLocalStorage('password');
          removeFromLocalStorage('portrait');
        }
        dispatch(loginSuccess(response.data.user));
        navigate('/home', { replace: true });
      } else {
        dispatch(loginFailure('Invalid user.'));
      }
    } catch (error) {
      dispatch(loginFailure('Thrive user info failed. Please try again.'));
    }
  };

  // handle four types of login
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
        const response = await axios.post(config.proxy.common, {
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
          updateUserInfo();
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

  // send verification code
  const sendVerificationCode = async () => {
    let email = `${emailName}@${emailDomain}`;
    let content = {};

    if (activeTab === 'email') {
      content.email = email;
    } else {
      content.username = username;
    }

    if ((email && activeTab === 'email') || (username && activeTab === 'username')) {
      dispatch(sendCodeRequest());

      try {
        const response = await axios.post(config.proxy.common, {
          type: 'get_verificationcode',
          content,
          extra: null,
        });

        if (response.data.success) {
          dispatch(sendCodeSuccess());
          alert('Verification code sent. Please check your mailbox.');
        } else {
          dispatch(sendCodeFailure('Failed to send verification code. Please try again.'));
        }
      } catch (error) {
        dispatch(sendCodeFailure('Failed to send verification code. Please try again.'));
      }
    } else {
      alert(`Please enter your ${activeTab}`);
    }
  };

  return (
    <div className={styles.container}>
      <img src={portrait || DefaultUserIcon} alt="User Icon" className={styles.icon} />
      <div className={styles.tabContainer}>
        <button
          className={[styles.tab, activeTab === 'username' ? styles.activeTab : ''].join(' ')}
          onClick={() => setActiveTab('username')}
        >
          Username
        </button>
        <button
          className={[styles.tab, activeTab === 'email' ? styles.activeTab : ''].join(' ')}
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
          className={styles.input}
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
          <button className={styles.linkButton} onClick={() => setActiveVerification('password')}>
            Login with Password
          </button>
        </>
      ) : (
        <>
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <button className={styles.linkButton} onClick={() => setActiveVerification('verification code')}>
            Login with Verification Code
          </button>
        </>
      )}

      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id="customCheckbox"
          checked={saveAccount}
          onChange={() => dispatch(toggleSaveAccount())}
        />
        <label htmlFor="customCheckbox" className={styles.label}>Save Account</label>
      </div>
      <SingleButton title={isLoading ? <Spinner size="minor" /> : "Login"} onPress={handleLogin} disable={isLoading} />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default LoginInterface;

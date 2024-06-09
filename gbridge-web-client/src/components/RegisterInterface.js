import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { EmailInput } from './InfoInputs';
import { PasswordInput, UsernameInput } from './RuleTextInput';
import { MyButton, SingleButton } from './MyButton';
import Spinner from './Spinner';
import { useAxios } from '../utils/AxiosContext';
import styles from './RegisterInterface.module.css';
import {
    registerFailure, registerRequest, registerSuccess,
    sendCodeFailure, sendCodeRequest, sendCodeSuccess, reset
} from '../store/authSlice';
import { setCredentials } from '../store/globalSlice';
import config from '../config/config.json';

const RegisterInterface = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const axios = useAxios();
    const { isLoading, isCodeSent, error } = useSelector((state) => state.auth);

    const [emailName, setEmailName] = useState('');
    const [emailDomain, setEmailDomain] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [username, setUsername] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [passwordValid, setPasswordValid] = useState(false);
    const [usernameValid, setUsernameValid] = useState(false);

    useEffect(() => {
        return () => {
            dispatch(reset());
        }
    }, [dispatch]);

    const sendVerificationCode = async () => {
        const email = `${emailName}@${emailDomain}`;
        if (email) {
            dispatch(sendCodeRequest());
            try {
                const response = await axios.post(config.proxy.common, {
                    type: 'get_verificationcode',
                    content: { email },
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
            alert('Please enter your email');
        }
    };

    const handleRegister = async () => {
        if (password !== passwordConfirm) {
            alert('Passwords do not match');
        } else if (emailName && emailDomain && verificationCode && password && username) {
            dispatch(registerRequest());
            const email = `${emailName}@${emailDomain}`;
            try {
                const response = await axios.post(config.proxy.common, {
                    type: "register",
                    content: {
                        email: email,
                        verificationcode: verificationCode,
                        password: password,
                        username: username
                    },
                    extra: null
                });
                if (response.data.success) {
                    dispatch(registerSuccess(response.data.content));
                    dispatch(setCredentials({ username, password }));
                    navigate('/home', { replace: true });
                } else {
                    dispatch(registerFailure('Failed to register. Please try again.'));
                }
            } catch (error) {
                dispatch(registerFailure('Failed to register. Please try again.'));
            }
        } else {
            alert('Please fill in all fields');
        }
    };

    const renderModal = () => {
        return (
            <Modal
                isOpen={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                contentLabel="Terms and Conditions"
                className={styles.Modal}
                overlayClassName={styles.Overlay}
            >
                <div className={styles.modalView} >
                    <h2 className={styles.modalText}>terms and conditions</h2>
                    <div className={styles.modalBody} >
                        <p>Here are your terms and conditions. Please read them carefully.</p>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                    </div>
                    <MyButton title="Close" onPress={() => setModalVisible(false)} />
                </div>
            </Modal>
        );
    };

    return (
        <div className={styles.container}>
            {renderModal()}
            <EmailInput
                username={emailName}
                domain={emailDomain}
                onUsernameChange={setEmailName}
                onDomainChange={setEmailDomain}
                editable={!isCodeSent}
            />

            {isCodeSent && (
                <>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Verification Code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    <UsernameInput
                        placeholder="Your Username"
                        onTextChange={(username, isValid) => {
                            setUsername(username);
                            setUsernameValid(isValid);
                        }}
                    />
                    <PasswordInput
                        placeholder="Password"
                        onTextChange={(password, isValid) => {
                            setPassword(password);
                            setPasswordValid(isValid);
                        }}
                    />
                    <input
                        className={styles.input}
                        type="password"
                        placeholder="Password Confirm"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                    <div className={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            id="customCheckbox"
                            checked={acceptTerms}
                            onChange={() => setAcceptTerms(!acceptTerms)}
                        />
                        <label htmlFor="customCheckbox" className={styles.label}>Accept Terms and Conditions</label>
                        <button className={styles.linkButton} onClick={() => setModalVisible(true)}>View Terms</button>
                    </div>
                    <SingleButton title={isLoading ? <Spinner size="minor" /> : "Register"} onPress={handleRegister} disable={isLoading || !acceptTerms || !passwordValid || !usernameValid} />
                </>
            )}

            {!isCodeSent && (
                <MyButton title="Send Verification Code" onPress={sendVerificationCode} disable={isLoading || isCodeSent} />
            )}
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default RegisterInterface;

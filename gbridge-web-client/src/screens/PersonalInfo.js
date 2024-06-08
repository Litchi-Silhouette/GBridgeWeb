import React, { useState, useEffect } from 'react';
import { useAxios } from '../utils/AxiosContext';
import DefaultUserIcon from '../assets/default_user_icon.png';
import { TwoButtonsInline } from '../components/MyButton';
import styles from './PersonalInfo.module.css'; // Import the CSS module
import { useSelector } from 'react-redux';
import Spinner from '../components/Spinner';
import { NumberInput, YesNoChoice } from '../components/InfoInputs';
import { ImageCropModal } from '../components/ImageCropModal';
import { useDispatch } from 'react-redux';
import { setPortrait, setAuthenticated } from '../store/globalSlice';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/localStorageUtils';
import Header from '../components/Header';
import config from '../config/config.json';

const PersonalInfo = () => {
    const [state, setState] = useState({
        newIcon: null,
        email: '',
        cash: 0,
        income: 0,
        expenditure: 0,
        debt: 0,
        assets: 0,
        no_of_dependents: 1,
        graduated: false,
        self_employed: false,
        residential_assets_value: 0,
        commercial_assets_value: 0,
        luxury_assets_value: 0,
        bank_asset_value: 0,
        loading: true,  // Initial state for loading
        isLoading: false,
    });
    const [realName, setRealName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('');
    const [view, setView] = useState('info');  // ['info', 'verification', 'modification'
    const username = useSelector(state => state.global.username);
    const userIcon = useSelector(state => state.global.portrait);
    const verified = useSelector(state => state.global.authenticated);
    const dispatch = useDispatch();
    const axios = useAxios();

    const fetchUserData = async () => {
        setState(prevState => ({ ...prevState, loading: true }));
        try {
            const response = await axios.post(config.proxy.common, {
                type: "get_user_info",
                content: [
                    "email",
                    "cash",
                    "income",
                    "expenditure",
                    "debt",
                    "assets",
                    "no_of_dependents",
                    "graduated",
                    "self_employed",
                    "residential_assets_value",
                    "commercial_assets_value",
                    "luxury_assets_value",
                    "bank_asset_value"
                ],
                extra: null
            });

            if (response.data.success) {
                const { email, cash, income, expenditure, debt, assets, no_of_dependents, graduated, self_employed, residential_assets_value, commercial_assets_value, luxury_assets_value, bank_asset_value } = response.data.content;
                setState({
                    email,
                    cash,
                    income,
                    expenditure,
                    debt,
                    assets,
                    no_of_dependents,
                    graduated,
                    self_employed,
                    residential_assets_value,
                    commercial_assets_value,
                    luxury_assets_value,
                    bank_asset_value,
                    loading: false  // Stop the loading indicator
                });
            } else {
                alert("Failed to fetch user data.");
                setState(prevState => ({ ...prevState, loading: false }));
            }
        } catch (error) {
            alert("Failed to fetch user data.");
            setState(prevState => ({ ...prevState, loading: false }));
        }
    };

    useEffect(() => {
        console.log('PersonalInfo mounted');
        fetchUserData();
    }, []);

    const handleVerificationPress = () => {
        setView('verification');
    };

    const handleModificationPress = () => {
        setView('modification');
    };

    const { email, newIcon, cash, loading, income, expenditure, debt, assets, no_of_dependents, graduated, self_employed, residential_assets_value, commercial_assets_value, luxury_assets_value, bank_asset_value, isLoading } = state;

    const handleModification = async () => {
        if ((cash !== null && income !== null && expenditure !== null && debt !== null && assets !== null && no_of_dependents !== null && graduated !== null && self_employed !== null && residential_assets_value !== null && commercial_assets_value !== null && luxury_assets_value !== null && bank_asset_value !== null) || newIcon) {
            setState(prevState => ({ ...prevState, isLoading: true }));
            let content = {};
            if (newIcon) {
                content['portrait'] = newIcon;
            }
            content['cash'] = cash;
            content['income'] = income;
            content['expenditure'] = expenditure;
            content['debt'] = debt;
            content['assets'] = assets;
            content['no_of_dependents'] = no_of_dependents;
            content['graduated'] = graduated;
            content['self_employed'] = self_employed;
            content['residential_assets_value'] = residential_assets_value;
            content['commercial_assets_value'] = commercial_assets_value;
            content['luxury_assets_value'] = luxury_assets_value;
            content['bank_asset_value'] = bank_asset_value;

            try {
                const response = await axios.post(config.proxy.common, {
                    type: "update_user_info",
                    content: content,
                    extra: null
                });

                setState(prevState => ({ ...prevState, isLoading: false }));

                if (response.data.success) {
                    if (newIcon) {
                        dispatch(setPortrait(newIcon));
                        getFromLocalStorage('saveAccount') && saveToLocalStorage('portrait', newIcon);
                        setState(prevState => ({ ...prevState, newIcon: null }));
                    }
                    alert('Profile updated successfully!');
                } else {
                    alert('Failed to update profile.');
                }
            } catch (error) {
                alert('Failed to update profile.');
                setState(prevState => ({ ...prevState, isLoading: false }));
            }
        } else {
            alert("Please enter valid changes.");
        }
    };

    const setImage = (image) => {
        setState(prevState => ({ ...prevState, newIcon: image }));
    };

    const clearIDAndBack = () => {
        setRealName('');
        setIdNumber('');
        setVerificationStatus('');
        setView('info');
    };

    const uploadIDDocuments = () => {
        if (!realName || !idNumber) {
            alert("Error: All fields are required!");
            return;
        }
        setVerificationStatus('Verification in progress...');

        axios.post(config.proxy.common, {
            type: "update_user_info",
            content: { authenticated: true },
            extra: { name: realName, idNumber: idNumber },
        })
            .then(response => {
                if (response.data.success) {
                    alert('Verification successful!');
                    dispatch(setAuthenticated(true));
                    setVerificationStatus('Verification successful!');
                } else {
                    alert('Verification failed. Please try again.');
                    setVerificationStatus('Verification failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Verification failed: ', error);
                alert('Verification failed. Please try again.');
                setVerificationStatus('Verification failed. Please try again.');
            });
    };

    const renderInfo = () => {
        if (loading)
            return (
                <div className={styles.rowContainer}>
                    <Spinner size='large' />
                </div>
            )
        return (
            <>
                <img src={userIcon || DefaultUserIcon} alt="User Icon" className={styles.icon} />
                <div className={styles.rowContainer}>
                    <div className={styles.infoContainer}>
                        <p className={styles.info}>Username: {username}</p>
                        <p className={styles.info}>Email: {email}</p>
                        <p className={styles.info}>{verified ? 'Verified' : 'Not Verified'}</p>
                        <p className={styles.info}>Cash: ${cash ? cash.toString() : '0'}</p>
                        <p className={styles.info}>Income: ${income ? income.toString() : '0'}/month</p>
                        <p className={styles.info}>Expenditure: ${expenditure ? expenditure.toString() : '0'}/month</p>
                        <p className={styles.info}>Debt: ${debt ? debt.toString() : '0'}</p>
                        <p className={styles.info}>Assets: ${assets ? assets.toString() : '0'}</p>
                    </div>
                    <div className={styles.infoContainer}>
                        <p className={styles.info}>Number of Dependents: {no_of_dependents}</p>
                        <p className={styles.info}>Graduated: {graduated ? 'Yes' : 'No'}</p>
                        <p className={styles.info}>Self Employed: {self_employed ? 'Yes' : 'No'}</p>
                        <p className={styles.info}>Residential Assets Value: ${residential_assets_value ? residential_assets_value.toString() : '0'}</p>
                        <p className={styles.info}>Commercial Assets Value: ${commercial_assets_value ? commercial_assets_value.toString() : '0'}</p>
                        <p className={styles.info}>Luxury Assets Value: ${luxury_assets_value ? luxury_assets_value.toString() : '0'}</p>
                        <p className={styles.info}>Bank Asset Value: ${bank_asset_value ? bank_asset_value.toString() : '0'}</p>
                    </div>
                </div>
            </>
        );
    }

    const renderModification = () => {
        return (
            <>
                <ImageCropModal onConfirm={setImage} icon={
                    <img src={newIcon || userIcon || DefaultUserIcon} alt="User Icon" className={styles.icon} />
                } />
                <div className={styles.rowContainer}>
                    <div className={styles.infoContainer}>
                        <NumberInput iniValue={cash?.toString() || "null"} prompt="Cash" updateValue={(value) => setState(prevState => ({ ...prevState, cash: value, cashValid: value !== null }))} />
                        <NumberInput iniValue={income?.toString() || "null"} prompt="Income" updateValue={(value) => setState(prevState => ({ ...prevState, income: value, incomeValid: value !== null }))} tail="/month" />
                        <NumberInput iniValue={expenditure?.toString() || "null"} prompt="Expenditure" updateValue={(value) => setState(prevState => ({ ...prevState, expenditure: value, expenditureValid: value !== null }))} tail="/month" />
                        <NumberInput iniValue={debt?.toString() || "null"} prompt="Debt" updateValue={(value) => setState(prevState => ({ ...prevState, debt: value, debtValid: value !== null }))} />
                        <NumberInput iniValue={assets?.toString() || "null"} prompt="Assets" updateValue={(value) => setState(prevState => ({ ...prevState, assets: value, assetsValid: value !== null }))} />
                        <NumberInput iniValue={no_of_dependents?.toString() || "null"} prompt="Number of Dependents" updateValue={(value) => setState(prevState => ({ ...prevState, no_of_dependents: value, no_of_dependentsValid: value !== null }))} />
                    </div>
                    <div className={styles.infoContainer}>
                        <YesNoChoice iniValue={graduated} prompt="Graduated" updateValue={(value) => setState(prevState => ({ ...prevState, graduated: value }))} />
                        <YesNoChoice iniValue={self_employed} prompt="Self Employed" updateValue={(value) => setState(prevState => ({ ...prevState, self_employed: value }))} />
                        <NumberInput iniValue={residential_assets_value?.toString() || "null"} prompt="Residential Assets Value" updateValue={(value) => setState(prevState => ({ ...prevState, residential_assets_value: value, residential_assets_valueValid: value !== null }))} />
                        <NumberInput iniValue={commercial_assets_value?.toString() || "null"} prompt="Commercial Assets Value" updateValue={(value) => setState(prevState => ({ ...prevState, commercial_assets_value: value, commercial_assets_valueValid: value !== null }))} />
                        <NumberInput iniValue={luxury_assets_value?.toString() || "null"} prompt="Luxury Assets Value" updateValue={(value) => setState(prevState => ({ ...prevState, luxury_assets_value: value, luxury_assets_valueValid: value !== null }))} />
                        <NumberInput iniValue={bank_asset_value?.toString() || "null"} prompt="Bank Asset Value" updateValue={(value) => setState(prevState => ({ ...prevState, bank_asset_value: value, bank_asset_valueValid: value !== null }))} />
                    </div>
                </div>
            </>
        );
    }

    const renderVerification = () => {
        return (
            <>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter your real name"
                    value={realName}
                    onChange={e => setRealName(e.target.value)}
                />
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter your ID number"
                    value={idNumber}
                    onChange={e => setIdNumber(e.target.value)}
                />
                <p>{verificationStatus}</p>
            </>
        )
    }

    const renderButton = () => {
        if (view === 'info') {
            return (
                <TwoButtonsInline
                    title1="Verify" title2="Modify"
                    onPress1={handleVerificationPress} onPress2={handleModificationPress}
                    disable1={verified} disable2={false} />
            )
        }
        else if (view === 'verification') {
            return (
                <TwoButtonsInline
                    title1={isLoading ? <Spinner size='minor' /> : "Confirm"} title2="Cancel"
                    onPress1={uploadIDDocuments} onPress2={clearIDAndBack}
                    disable1={verified} disable2={false} />
            )
        }
        else if (view === 'modification') {
            return (
                <TwoButtonsInline
                    title1={isLoading ? <Spinner size='minor' /> : "Confirm"} title2="Cancel"
                    onPress1={handleModification} onPress2={() => setView('info')}
                    disable1={false} disable2={false} />
            )
        }
    }

    return (
        <div className={styles.container}>
            <Header />
            {view === 'info' && renderInfo()}
            {view === 'verification' && renderVerification()}
            {view === 'modification' && renderModification()}
            {renderButton()}
        </div>
    );
};

export default PersonalInfo;

import React, { useState } from 'react';
import './MyButton.css';
import LogoutIcon from '../assets/logout.png';
import HomeIcon from '../assets/home.png';
import ScoreIcon from '../assets/score.png';
import MarketIcon from '../assets/market.png';
import ProfileIcon from '../assets/profile.png';
import BellIcon from '../assets/bell.png';
import InputModal from './InputModal';

const IPSetting = () => {
    const [visibility, setVisibility] = useState(false);

    return (
        <button onClick={() => setVisibility(true)} className="ip-setting-button">
            <InputModal modalVisible={visibility} onConfirm={(text) => {
                console.log(text);
                global.host = text.trim();
                setVisibility(false);
            }} onRequestClose={() => setVisibility(false)}
                title={"Enter server IP:"}
                placeholder={global.host}
            />
        </button>
    );
};

const IconButton = ({ onPress, image, selected }) => {
    return (
        <button onClick={onPress} className={`icon-button ${selected ? 'selected' : ''}`}>
            <img src={image} alt="icon" className="icon-image" />
        </button>
    );
};

const BottomBar = ({ navigation, selected }) => {
    return (
        <div className="button-container">
            <HomeButton onPress={() => navigation('/dummy?target=/home', { replace: true })} selected={selected === 'Home'} />
            <MarketButton onPress={() => navigation('/dummy?target=/PersonalPage', { replace: true })} selected={selected === 'PersonalPage'} />
            <ProfileButton onPress={() => navigation('/dummy?target=/PersonalInfo', { replace: true })} selected={selected === 'PersonalInfo'} />
            <ScoreButton onPress={() => navigation('/dummy?target=/Score', { replace: true })} selected={selected === 'Score'} />
        </div>
    );
};

const NotificationButton = ({ onPress }) => {
    return (
        <IconButton onPress={onPress} image={BellIcon} />
    );
};

const LogoutButton = ({ onPress }) => {
    return (
        <IconButton onPress={onPress} image={LogoutIcon} />
    );
};

const HomeButton = ({ onPress, selected }) => {
    return (
        <IconButton onPress={onPress} image={HomeIcon} selected={selected} />
    );
};

const ScoreButton = ({ onPress, selected }) => {
    return (
        <IconButton onPress={onPress} image={ScoreIcon} selected={selected} />
    );
};

const MarketButton = ({ onPress, selected }) => {
    return (
        <IconButton onPress={onPress} image={MarketIcon} selected={selected} />
    );
};

const ProfileButton = ({ onPress, selected }) => {
    return (
        <IconButton onPress={onPress} image={ProfileIcon} selected={selected} />
    );
};

const MyButton = ({ title, onPress, disable }) => {
    return (
        <button className={`my-button ${disable ? 'disabled' : ''}`} onClick={onPress} disabled={disable}>
            {title}
        </button>
    );
};

const SingleButton = ({ title, onPress, disable }) => {
    return (
        <button className={`single-button ${disable ? 'disabled' : ''}`} onClick={onPress} disabled={disable}>
            {title}
        </button>
    );
};

const TwoButtonsInline = ({ title1, title2, onPress1, onPress2, disable1, disable2 }) => {
    return (
        <div className="buttons-inline-container">
            <MyButton title={title1} onPress={onPress1} disable={disable1} />
            <MyButton title={title2} onPress={onPress2} disable={disable2} />
        </div>
    );
};

export { MyButton, TwoButtonsInline, SingleButton, LogoutButton, BottomBar, IPSetting, NotificationButton };

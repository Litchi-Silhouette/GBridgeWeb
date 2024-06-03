import React, { useState } from 'react';
import styles from './InfoInputs.module.css';
import { MyButton } from './MyButton';

const VerificationCodeInput = ({ onSendCode, onCodeChange, disabled }) => {
    return (
        <div className={styles.codeContainer}>
            <input
                className={styles.codeInput}
                type="text"
                placeholder="Enter code"
                onChange={(e) => onCodeChange(e.target.value)}
            />
            <MyButton
                title="Send Code"
                onPress={onSendCode}
                disable={disabled}
            />
        </div>
    );
};

class EmailInput extends React.Component {
    render() {
        const { emailName, emailDomain, onUsernameChange, onDomainChange, editable } = this.props;
        return (
            <div className={styles.emailContainer}>
                <input
                    className={[styles.emailInput, styles.usernameInput].join(' ')}
                    onChange={(e) => onUsernameChange(e.target.value)}
                    value={emailName}
                    placeholder="Email Address"
                    disabled={!editable}
                />
                <span className={styles.atSymbol}>@</span>
                <input
                    className={[styles.emailInput, styles.domainInput].join(' ')}
                    onChange={(e) => onDomainChange(e.target.value)}
                    value={emailDomain}
                    placeholder="domain.com"
                    disabled={!editable}
                />
            </div>
        );
    }
}

const NumberInput = ({ iniValue, prompt, tail, updateValue }) => {
    const [input, setInput] = useState(iniValue);
    const [isValid, setIsValid] = useState(true);

    const handleInputChange = (text) => {
        setInput(text);
        if (text.trim() !== '' && /^-?\d+(\.\d+)?$/.test(text.trim()) && !isNaN(parseFloat(text))) {
            setIsValid(true);
            updateValue(parseFloat(text));
        } else {
            setIsValid(false);
            updateValue(null);
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.prompt}>{prompt}:</label>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    className={`${styles.input} ${!isValid && input.length > 0 ? styles.inputInvalid : ''}`}
                    value={input}
                    placeholder={iniValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                />
                {input.length > 0 && (
                    <span className={isValid ? styles.validIndicator : styles.invalidIndicator}>
                        {isValid ? '✓' : '✗'}
                    </span>
                )}
            </div>
            {tail && <span className={styles.label}>{tail}</span>}
        </div>
    );
};

const LabelInput = ({ iniValue, prompt, tail, updateValue }) => {
    const [input, setInput] = useState(iniValue);

    const handleInputChange = (text) => {
        setInput(text);
        updateValue(text);
    };

    return (
        <div className={styles.container}>
            <label className={styles.prompt}>{prompt}:</label>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    className={styles.input}
                    value={input}
                    placeholder={iniValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                />
            </div>
            {tail && <span className={styles.label}>{tail}</span>}
        </div>
    );
};

const YesNoChoice = ({ prompt, updateValue, iniValue }) => {
    const [selectedOption, setSelectedOption] = useState(iniValue);

    const handlePress = (option) => {
        setSelectedOption(option);
        updateValue(option);
    };

    return (
        <div className={styles.selectedContainer}>
            <p className={styles.optionPrompt}>{prompt}:</p>
            <div className={styles.optionsContainer}>
                <button
                    className={`${styles.option} ${selectedOption ? styles.selectedOption : ''}`}
                    onClick={() => handlePress(true)}
                >
                    Yes
                </button>
                <button
                    className={`${styles.option} ${!selectedOption ? styles.selectedOption : ''}`}
                    onClick={() => handlePress(false)}
                >
                    No
                </button>
            </div>
        </div>
    );
};

export { EmailInput, VerificationCodeInput, NumberInput, LabelInput, YesNoChoice };

import React, { useState } from 'react';
import styles from './RuleTextInput.module.css';

// check is regex test function
const UsernameInput = (props) => (
    <RuleTextInput
        {...props}
        rules="Username must be 4-10 characters long and contain only letters, numbers, and underscores"
        check={(username) => {
            if (props.allowEmpty && username === '') return true;
            const regex = /^[A-Za-z0-9_]{4,10}$/;
            return regex.test(username);
        }}
    />
);

const PasswordInput = (props) => (
    <RuleTextInput
        {...props}
        rules="Password must be 6-12 characters long"
        check={(password) => {
            if (props.allowEmpty && password === '') return true;
            const regex = /^.{6,12}$/;
            return regex.test(password);
        }}
        secureTextEntry
    />
);

const RuleTextInput = ({ placeholder, rules, check, secureTextEntry, onTextChange }) => {
    const [input, setInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleChange = (event) => {
        const value = event.target.value;
        setInput(value);
        onTextChange(value, check(value));
    };

    const isValid = check(input);

    return (
        <div className={styles.container}>
            <input
                type={secureTextEntry ? 'password' : 'text'}
                className={[styles.input, !isValid && input.length > 0 ? styles.inputInvalid : ''].join(' ')}
                value={input}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
            />
            {input.length > 0 && (
                <span className={isValid ? styles.validIndicator : styles.invalidIndicator}>
                    {isValid ? '✓' : '✗'}
                </span>
            )
            }
            {isFocused && <p className={styles.rules}>{rules}</p>}
        </div >
    );
};

export { RuleTextInput, UsernameInput, PasswordInput };

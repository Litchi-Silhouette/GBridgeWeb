import React from 'react';
import './InfoInputs.css';
import { MyButton } from './MyButton';

const VerificationCodeInput = ({ onSendCode, onCodeChange, disabled }) => {
    return (
        <div className="codeContainer">
            <input
                className="codeInput"
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
            <div className="emailContainer">
                <input
                    className="emailInput usernameInput"
                    onChange={(e) => onUsernameChange(e.target.value)}
                    value={emailName}
                    placeholder="Email Address"
                    disabled={!editable}
                />
                <span className="atSymbol">@</span>
                <input
                    className="emailInput domainInput"
                    onChange={(e) => onDomainChange(e.target.value)}
                    value={emailDomain}
                    placeholder="domain.com"
                    disabled={!editable}
                />
            </div>
        );
    }
}

export { EmailInput, VerificationCodeInput };

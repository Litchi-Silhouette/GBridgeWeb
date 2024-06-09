import React, { useState } from 'react';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useAxios } from '../utils/AxiosContext';
import config from '../config/config.json';
import { SingleButton } from './MyButton';
import Spinner from './Spinner';

const RepaymentInterface = ({ loanDetail, goBack }) => {
    const axios = useAxios();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const initiatePaymentProcess = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(config.proxy.common, {
                type: "complete_deal",
                content: {
                    _id: loanDetail._id,
                    paymentMethod: selectedPaymentMethod
                }
            });
            setIsLoading(false);
            if (response.data.success) {
                alert('Payment successful.');
                goBack(true);
            } else
                throw new Error();
        }
        catch (error) {
            alert('Payment failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <p style={styles.info}>Payment Due: {loanDetail.amount}</p>
            <p style={styles.info}>Start Date: {loanDetail.date}</p>
            <p style={styles.info}>Period: {loanDetail.period}</p>
            <FormControl fullWidth style={styles.pickerContainer}>
                <InputLabel sx={{
                    transform: (isFocused || selectedPaymentMethod) ? 'translate(14px, -16px) scale(0.75)' : 'translate(14px, 16px) scale(1)',
                    transition: 'transform 200ms',
                }}>Select payment method</InputLabel>
                <Select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    onAbort={() => setIsFocused(false)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                >
                    <MenuItem value=""><em>Select payment method</em></MenuItem>
                    <MenuItem value="credit">Credit Card</MenuItem>
                    <MenuItem value="debit">Debit Card</MenuItem>
                    <MenuItem value="paypal">PayPal</MenuItem>
                </Select>
            </FormControl>
            <div style={styles.buttonContainer}>
                <SingleButton title={isLoading ? <Spinner size="minor" /> : "Pay"} onPress={initiatePaymentProcess} disable={selectedPaymentMethod === '' || isLoading} />
                <SingleButton title="Back" onPress={() => goBack(false)} />
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '60%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    },
    pickerContainer: {
        margin: '20px 0',
    },
    info: {
        marginBottom: '10px',
        textAlign: 'center',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        margin: '10px',
    },
};

export default RepaymentInterface;

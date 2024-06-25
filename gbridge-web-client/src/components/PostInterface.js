import React, { useState, useRef } from 'react';
import {
    TextField, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { useAxios } from '../utils/AxiosContext';
import InputModal from '../components/InputModal';
import { ImagePicker } from './ImageCropModal';
import { NumberInput, LabelInput } from '../components/InfoInputs';
import { TwoButtonsInline, TextButton } from '../components/MyButton';
import Spinner from './Spinner';
import styles from './PostInterface.module.css';
import config from '../config/config.json';

const PostInterface = ({ post_type, goBack }) => {
    const [state, setState] = useState({
        post_type: post_type,
        poster: post_type === 'lend' ? 'Investor' : 'Borrower',
        amount: 0.0,
        amountValid: false,
        interest: 0.0,
        interestValid: false,
        period: 0,
        periodValid: false,
        description: 'None',
        extra: null,
        loanType: '',
        isLoading: false,
        isSubmitted: false,
        modalVisible: false,
    });
    const [isFocused, setIsFocused] = useState(false);

    const amountRef = useRef(null);
    const interestRef = useRef(null);
    const periodRef = useRef(null);
    const axios = useAxios();

    // prompt for the user to get advice from GPT
    const prompt = "Supposing you are an expert in financial consulting, now you are asked to suggest the user a certain " + post_type + " post.\n" +
        "Your response should be a single json:{\"amount\":Number,\"interest\":Number,\"period\":Number, \"loanType\":String,\"description\":String}\nThe unit of amount is $, it is a positive number.\nThe unit of interest is yearly interest rate, it is a float number between 0 to 1.\nThe unit of period is months, it is a positive integer.\nThere are altogether 3 types of loan: \"Full Payment\", \"Interest-Bearing\", \"Interest-Free\".\nPut your detailed description of the post in the description field, which should show the features of the post to attract other users to match. Most importantly, don't leak any user information!\n";

    // check the post before submission
    const checkPost = async () => {
        setState(prevState => ({ ...prevState, isLoading: true }));
        try {
            const infoOrgResponse = await axios.post(config.proxy.common, {
                type: "get_user_info",
                content: [
                    "income",
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
            const infoResponse = infoOrgResponse.data;
            if (infoResponse.success) {
                const { income, no_of_dependents, graduated, self_employed, residential_assets_value,
                    commercial_assets_value, luxury_assets_value, bank_asset_value
                } = infoResponse.content;
                const { amount, period } = state;
                let score = 0.5, income_annum = income * 12, total_assets = residential_assets_value + commercial_assets_value + luxury_assets_value + bank_asset_value, years = period / 12;

                const scoreOrgResponse = await axios.post(config.proxy.common, {
                    type: "estimate_score",
                    content: {},
                    extra: null
                });
                if (scoreOrgResponse.data.success && scoreOrgResponse.data.content !== null)
                    score = scoreOrgResponse.data.content.score;
                score = parseInt(score * 1000);
                if (post_type === 'lend') {
                    if (amount > total_assets * 0.1)
                        showWarning('The amount is over 10% of your assets.');
                    else if (score < 700)
                        showWarning('Your credit score is too low for the investment.');
                    else
                        handleSubmit();
                }
                else {
                    let info = {
                        income_annum, no_of_dependents, graduated, self_employed,
                        residential_assets_value, commercial_assets_value, luxury_assets_value, bank_asset_value,
                        loan_amount: amount, loan_term: years, cibil_score: score
                    };
                    for (const key in info)
                        if (info[key] === null)
                            info[key] = 0;
                    if (info.graduated === 0) info.graduated = false;
                    if (info.self_employed === 0) info.self_employed = false;

                    const orgResponse = await axios.post(config.proxy.common, {
                        type: "borrow_post_estimate_score",
                        content: info,
                        extra: null
                    });
                    const response = orgResponse.data;
                    if (response.success && response.content !== null) {
                        if (response.content.score < 0.7)
                            showWarning('The estimated score is too low for the loan.');
                        else
                            handleSubmit();
                    }
                    else
                        throw new Error("Failed to estimate the score.");
                }
            }
            else
                throw new Error("Failed to get user information.");
        } catch (error) {
            console.error(error);
            setState(prevState => ({ ...prevState, isLoading: false }));
        }
    };

    const showWarning = (message) => {
        message += '\nDo you still want to submit the post?';
        if (window.confirm(message))
            handleSubmit();
    }

    const handleSubmit = async () => {
        const { poster, amount, interest, period, description, loanType, extra } = state;
        try {
            const orgResponse = await axios.post(config.proxy.common, {
                type: "submit_market_post",
                content: {
                    post_type: post_type,
                    method: loanType,
                    poster, amount, interest, period, description, extra
                },
                extra: null
            });
            const response = orgResponse.data;
            if (response.success) {
                setState(prevState => ({ ...prevState, isSubmitted: true, isLoading: false }));
                alert('Investment details submitted successfully.');
            }
            else
                throw new Error("Failed to submit investment details.");
        } catch (error) {
            alert('Failed to submit investment details.');
            setState(prevState => ({ ...prevState, isLoading: false }));
        }
    };

    const askAdvice = async (text) => {
        setState(prevState => ({ ...prevState, isLoading: true, modalVisible: false }));
        // refine prompt for the user to get advice from GPT
        let prompt_all = prompt;
        if (!(text === null || text.trim() === ''))
            prompt_all += "The user's addition request is: " + text + "\n";
        prompt_all += "Please give your advice for his " + post_type + " post.\n" +
            "His information is listed below:\n";

        try {
            const orgResponse = await axios.post(config.proxy.common, {
                type: "send_single_message_to_bot",
                content: prompt_all,
                extra: null
            });
            setState(prevState => ({ ...prevState, isLoading: false }));
            const response = orgResponse.data;
            if (response.success && response.content !== null) {
                const advice = JSON.parse(response.content);
                setState(prevState => ({
                    ...prevState,
                    loanType: advice.loanType,
                    description: advice.description ? advice.description : 'None',
                }));
                amountRef.current?.changeInitialValue(advice.amount.toString());
                periodRef.current?.changeInitialValue(advice.period.toString());
                interestRef.current?.changeInitialValue(advice.interest.toString());
                alert('Advice requested successfully.');
            } else
                throw new Error("Failed to request advice.");
        } catch (error) {
            alert('Failed to request advice.');
            setState(prevState => ({ ...prevState, isLoading: false }));
        }
    };

    const pickExtra = (image) => {
        setState(prevState => ({ ...prevState, extra: image }));
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                {state.post_type === 'lend' ? "Investment" : "Loan Application"} Details
            </h2>
            <TextButton title="Ask advice from GPT" onPress={() => setState(prevState => ({ ...prevState, modalVisible: true }))} />
            <div className={styles.rowContainer}>
                <div className={styles.columnContainer}>
                    <FormControl fullWidth margin="normal" >
                        <InputLabel sx={{
                            transform: (isFocused || state.loanType) ? 'translate(14px, -16px) scale(0.75)' : 'translate(14px, 16px) scale(1)',
                            transition: 'transform 200ms',
                        }}>Select Loan Type</InputLabel>
                        <Select
                            value={state.loanType}
                            onChange={(e) => setState(prevState => ({ ...prevState, loanType: e.target.value }))}
                            onAbort={() => setIsFocused(false)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        >
                            <MenuItem value=""><em>Select Loan Type</em></MenuItem>
                            <MenuItem value="Full Payment">Lump Sum Payment</MenuItem>
                            <MenuItem value="Interest-Bearing">Interest-Bearing Installments</MenuItem>
                            <MenuItem value="Interest-Free">Interest-Free Installments</MenuItem>
                        </Select>
                    </FormControl>
                    <LabelInput iniValue={state.poster} prompt="Poster name" updateValue={(value) => setState(prevState => ({ ...prevState, poster: value }))} />
                    <NumberInput iniValue={state.amount.toString()} prompt="Amount" updateValue={(value) => {
                        if (value !== null)
                            setState(prevState => ({ ...prevState, amount: value, amountValid: true }));
                        else
                            setState(prevState => ({ ...prevState, amountValid: false }));
                    }} ref={amountRef} />
                    <NumberInput iniValue={state.interest.toString()} prompt="Interest" updateValue={(value) => {
                        if (value !== null)
                            setState(prevState => ({ ...prevState, interest: value, interestValid: true }));
                        else
                            setState(prevState => ({ ...prevState, interestValid: false }));
                    }} tail="/month" ref={interestRef} />
                    <NumberInput iniValue={state.period.toString()} prompt="Lock Period" updateValue={(value) => {
                        if (value !== null)
                            setState(prevState => ({ ...prevState, period: parseInt(value), periodValid: true }));
                        else
                            setState(prevState => ({ ...prevState, periodValid: false }));
                    }} tail="/month" ref={periodRef} />
                </div>
                <div className={styles.columnContainer}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Enter your descriptions here"
                        multiline
                        rows={4}
                        value={state.description}
                        onChange={(e) => setState(prevState => ({ ...prevState, description: e.target.value }))}
                        className={styles.input}
                    />
                    <ImagePicker onConfirm={pickExtra} />
                    {state.extra && <img src={state.extra} alt="Extra Info" className={styles.image} />}
                </div>
            </div>
            {state.modalVisible && <InputModal
                modalVisible={state.modalVisible}
                onRequestClose={() => setState(prevState => ({ ...prevState, modalVisible: false }))}
                onConfirm={askAdvice}
                title={"Enter your addition request:"}
                placeholder={"Here's an example: Want to get payback in 2 years."}
                multiline={true}
                canNone={true}
            />}
            <TwoButtonsInline
                title1="Submit"
                title2="Back"
                onPress1={checkPost}
                onPress2={goBack}
                disable1={!state.amountValid || !state.interestValid || !state.periodValid || state.loanType === "" || state.isLoading || state.isSubmitted}
                disable2={state.isLoading}
            />
            {state.isLoading && <Spinner size="small" />}
        </div>
    );
};

export default PostInterface;

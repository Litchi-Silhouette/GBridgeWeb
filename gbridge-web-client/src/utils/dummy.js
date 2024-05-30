import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Dummy = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const target = params.get('target');

        // Navigate to the target page and replace the dummy page in the history stack
        navigate(target || '/home', { replace: true });
    }, [navigate, location]);

    return null; // Render nothing
};

export default Dummy;

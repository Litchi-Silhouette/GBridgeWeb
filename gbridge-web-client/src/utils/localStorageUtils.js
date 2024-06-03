// Save data to local storage
export const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Get data from local storage
export const getFromLocalStorage = (key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
};

// Remove data from local storage
export const removeFromLocalStorage = (key) => {
    localStorage.removeItem(key);
};

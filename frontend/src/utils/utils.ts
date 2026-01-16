export const getBaseUrl = (): string => {
    if(window.location.hostname === 'localhost') {
        return 'http://localhost:5000';
    } else {
        return import.meta.env.VITE_API_URL || '';
    }
}
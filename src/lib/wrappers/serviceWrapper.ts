export const serviceWrapper = (fn) => {
    return (...args) => fn(...args);
};

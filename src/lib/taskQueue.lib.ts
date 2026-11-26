function ConsecutiveTaskQueueInit() {
    let queue = [];
    let currentProcessing = false;
    const checkProcessing = () => {
        return currentProcessing;
    };
    const addToQueue = (fn, params) => {
        queue.push({ fn, params });
        processQueue().catch((e) => console.error(e));
    };
    const processQueue = async () => {
        if (currentProcessing)
            return;
        while (queue.length) {
            currentProcessing = true;
            const { fn, params } = queue.shift();
            await fn(...params);
        }
        currentProcessing = false;
    };
    return {
        addToQueue,
        checkProcessing,
    };
}
export default ConsecutiveTaskQueueInit;

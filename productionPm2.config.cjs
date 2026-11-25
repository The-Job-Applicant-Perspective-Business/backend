module.exports = {
    apps: [
        {
            name: "tjapServer",
            script: "npm",
            args: "start",
        },
        {
            name: "tjapCron",
            script: "npm",
            args: "run start-cron",
        },
    ],
};

// Sends the revenue report and the health report immediately.
// Run from the API folder:  node /root/send-now.js
// The health run is the same as the 6 AM job (including its routine order cleanup).
process.chdir("/home/khatooncollection-api/htdocs/api.khatooncollection.in");
require("dotenv").config();

const dist = "/home/khatooncollection-api/htdocs/api.khatooncollection.in/dist";
const { sendDailySalesReport } = require(`${dist}/services/reportEmails`);
const { runDailyHealthCheck } = require(`${dist}/jobs/dailyHealthCheckCron`);
const { prisma } = require(`${dist}/lib/prisma`);

(async () => {
    await sendDailySalesReport();
    await runDailyHealthCheck();
    await prisma.$disconnect();
    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});

const { syncHeatingOilHistory } = require('./syncHeatingOilHistory');

const DEFAULT_HOUR = 6;
const DEFAULT_MINUTE = 15;

const toInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const syncHour = clamp(toInteger(process.env.HISTORY_SYNC_HOUR, DEFAULT_HOUR), 0, 23);
const syncMinute = clamp(toInteger(process.env.HISTORY_SYNC_MINUTE, DEFAULT_MINUTE), 0, 59);
const runImmediately = process.env.HISTORY_SYNC_IMMEDIATE !== 'false';

const formatDateTime = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date);

const getNextRunTime = () => {
  const now = new Date();
  const nextRun = new Date(now);

  nextRun.setHours(syncHour, syncMinute, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun;
};

const scheduleNextSync = () => {
  const nextRun = getNextRunTime();
  const delayMs = nextRun.getTime() - Date.now();

  console.log(
    `[history-sync] Next sync scheduled for ${formatDateTime(nextRun)} (server local time).`,
  );

  setTimeout(async () => {
    await runSyncCycle();
    scheduleNextSync();
  }, delayMs);
};

const runSyncCycle = async () => {
  console.log(`[history-sync] Starting sync at ${formatDateTime(new Date())}`);

  try {
    await syncHeatingOilHistory();
    console.log(`[history-sync] Sync finished successfully.`);
  } catch (error) {
    console.error(`[history-sync] Sync failed: ${error.message}`);
  }
};

const startScheduler = async () => {
  console.log(
    `[history-sync] Daily scheduler started. Target time ${String(syncHour).padStart(2, '0')}:${String(syncMinute).padStart(2, '0')}.`,
  );

  if (runImmediately) {
    await runSyncCycle();
  }

  scheduleNextSync();
};

startScheduler().catch((error) => {
  console.error(`[history-sync] Fatal error: ${error.message}`);
  process.exitCode = 1;
});

export const formatDate = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : '—';
export const formatBytes = (bytes = 0) => { if (!bytes) return '0 B'; const units = ['B', 'KB', 'MB', 'GB']; const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3); return `${(bytes / (1024 ** i)).toFixed(i ? 1 : 0)} ${units[i]}`; };
export const labelFor = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
export const showError = (error, fallback = 'Something went wrong.') => error?.response?.data?.message || fallback;

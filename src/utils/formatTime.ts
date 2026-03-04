import { formatDistanceToNowStrict } from 'date-fns';

export const timeAgo = (unixSeconds: number): string => {
  return formatDistanceToNowStrict(new Date(unixSeconds * 1000), {
    addSuffix: true,
  });
};

export const formatTimestamp = (unixSeconds: number): string => {
  return new Date(unixSeconds * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

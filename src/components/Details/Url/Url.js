import PropTypes from 'prop-types';
import React from 'react';

import { parseUrl } from '../../../utils';

const ELIPSIS = '…';

const elipsizeLeft = word => `${ELIPSIS}${word}`;

const resolveOrigin = ({ hostname, origin, port }, maxHostnameParts) => {
  const hostnameParts = hostname.split('.');
  if (hostnameParts.length <= maxHostnameParts) {
    return origin;
  }

  const resolvedHostname = hostnameParts.slice(hostnameParts.length - maxHostnameParts).join('.');
  const resolvedPort = port ? `:${port}` : '';

  return `${elipsizeLeft(resolvedHostname)}${resolvedPort}`;
};

const resolvePathname = ({ pathname }, maxPathnameParts) => {
  const pathnameParts = pathname.split('/').filter(part => part);
  if (pathnameParts.length <= maxPathnameParts) {
    return pathname;
  }

  const resolvedPathname = pathnameParts.slice(pathnameParts.length - maxPathnameParts).join('/');
  return `/${elipsizeLeft(`/${resolvedPathname}`)}`;
};

const resolveUrl = ({ urlObj, maxHostnameParts, maxPathnameParts }) =>
  `${resolveOrigin(urlObj, maxHostnameParts)}${resolvePathname(urlObj, maxPathnameParts)}`;

export const Url = ({ url, short, maxHostnameParts, maxPathnameParts }) => {
  const urlObj = short ? parseUrl(url) : undefined;

  const resolvedUrl = urlObj ? resolveUrl({ urlObj, maxHostnameParts, maxPathnameParts }) : url;
  const resolvedTitle = resolvedUrl === url ? undefined : url;

  return (
    <a href={url} title={resolvedTitle}>
      {resolvedUrl}
    </a>
  );
};

Url.propTypes = {
  url: PropTypes.string.isRequired,
  short: PropTypes.bool,
  maxHostnameParts: PropTypes.number,
  maxPathnameParts: PropTypes.number,
};

Url.defaultProps = {
  short: false,
  maxHostnameParts: 3,
  maxPathnameParts: 1,
};

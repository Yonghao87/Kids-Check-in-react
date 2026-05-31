import type { SVGProps } from 'react';
import type { IconName } from './types';

type Props = SVGProps<SVGSVGElement> & {
  name: IconName;
};

const common = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IslandIcon({ name, ...props }: Props) {
  return (
    <svg aria-hidden="true" {...common} {...props}>
      {paths[name]}
    </svg>
  );
}

export function PhoneTaskIcon({ name, ...props }: Props) {
  return (
    <svg aria-hidden="true" {...common} {...props}>
      {phonePaths[name] ?? paths[name]}
    </svg>
  );
}

const paths: Record<IconName, JSX.Element> = {
  book: (
    <>
      <path d="M5 5.5c2.5-1.2 4.7-.9 7 .7v13c-2.3-1.6-4.5-1.9-7-.7z" />
      <path d="M19 5.5c-2.5-1.2-4.7-.9-7 .7v13c2.3-1.6 4.5-1.9 7-.7z" />
    </>
  ),
  chinese: (
    <>
      <path d="M5 5.5c2.5-1.2 4.7-.9 7 .7v13c-2.3-1.6-4.5-1.9-7-.7z" />
      <path d="M19 5.5c-2.5-1.2-4.7-.9-7 .7v13c2.3-1.6 4.5-1.9 7-.7z" />
      <path d="M8 10h8M12 7v8" />
    </>
  ),
  calculator: (
    <>
      <rect x="6" y="3.5" width="12" height="17" rx="3" />
      <path d="M9 7h6" />
      <path d="M9 11h.1M12 11h.1M15 11h.1M9 15h.1M12 15h.1M15 15h.1" />
    </>
  ),
  language: (
    <>
      <path d="M4 5h9M8.5 5c-.2 4-1.6 7-4.5 9" />
      <path d="M5.5 9.5c1.7 2.4 3.8 3.9 6.5 4.5" />
      <path d="M15 19l3.4-8 3.6 8M16.2 16.2h4.5" />
    </>
  ),
  performance: (
    <>
      <path d="M7 7c2.2-1.1 3.9-.9 5 0v7c-1.5-1-3.2-1-5 0z" />
      <path d="M12 7c1.1-.9 2.8-1.1 5 0v7c-1.8-1-3.5-1-5 0z" />
      <path d="M7.5 17c2.8 2.5 6.2 2.5 9 0" />
    </>
  ),
  broom: (
    <>
      <path d="M14 4l6 6" />
      <path d="M12.5 5.5l6 6-7.5 7.5c-1.7 1.7-4.5 1.7-6.2 0l-.8-.8z" />
      <path d="M4.8 18.8l5.4-5.4M7.2 20.2l4.5-4.5" />
    </>
  ),
  run: (
    <>
      <circle cx="14.5" cy="4.5" r="1.8" />
      <path d="M12 8l3.2 2-2.2 3.2 3.8 2.3" />
      <path d="M10 20l3-6.8M6 11.5l3.8-1.4L12 8M16 10l2.5-1.8" />
    </>
  ),
  moon: <path d="M19 15.2A7.7 7.7 0 0 1 8.8 5a8.1 8.1 0 1 0 10.2 10.2z" />,
  tidy: (
    <>
      <path d="M5 9h14v10H5z" />
      <path d="M8 9V6h8v3M8 13h8M8 16h5" />
      <path d="M4 9l8-5 8 5" />
    </>
  ),
  star: <path d="M12 3.8l2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6L7.2 19l.9-5.5-4-3.9 5.5-.8z" />,
  crown: (
    <>
      <path d="M4 8l4.2 3.4L12 5l3.8 6.4L20 8l-1.2 10H5.2z" />
      <path d="M6 20h12" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="2" />
      <path d="M4 13h16M12 9v11" />
      <path d="M12 9C9 9 7 7.8 7 6.1 7 5 7.8 4.2 8.9 4.2 10.8 4.2 12 9 12 9z" />
      <path d="M12 9c3 0 5-1.2 5-2.9 0-1.1-.8-1.9-1.9-1.9C13.2 4.2 12 9 12 9z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c1.3-3.5 3.7-5.2 7-5.2s5.7 1.7 7 5.2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1c.5.4 1.1.8 1.7 1l.3 3h5l.3-3c.6-.2 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z" />
    </>
  ),
  history: (
    <>
      <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6" />
      <path d="M4 4v4.6h4.6M12 8v5l3.2 2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  download: <path d="M12 4v10M8 10l4 4 4-4M5 20h14" />,
  upload: <path d="M12 20V10M8 14l4-4 4 4M5 4h14" />,
  key: (
    <>
      <circle cx="8" cy="14" r="4" />
      <path d="M11 11l8-8M15 7l2 2M17 5l2 2" />
    </>
  ),
  trash: (
    <>
      <path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7l1-3h4l1 3" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h5l10-10a2.1 2.1 0 0 0-3-3L6 17z" />
      <path d="M14.5 7.5l3 3" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
};

const phonePaths: Partial<Record<IconName, JSX.Element>> = {
  chinese: (
    <>
      <path fill="#fff8e7" stroke="none" d="M4.7 6.2c2.6-1.1 5-.9 7.3.8v12.2c-2.4-1.6-4.8-1.9-7.3-.8z" />
      <path fill="#fff8e7" stroke="none" d="M19.3 6.2c-2.6-1.1-5-.9-7.3.8v12.2c2.4-1.6 4.8-1.9 7.3-.8z" />
      <path stroke="#794f27" d="M4.7 6.2c2.6-1.1 5-.9 7.3.8v12.2c-2.4-1.6-4.8-1.9-7.3-.8zM19.3 6.2c-2.6-1.1-5-.9-7.3.8v12.2c2.4-1.6 4.8-1.9 7.3-.8z" />
      <path stroke="#794f27" strokeWidth="2.2" d="M8.4 10.2h7.2M12 8.1v7.6" />
    </>
  ),
  calculator: (
    <>
      <rect x="5.4" y="3.8" width="13.2" height="16.4" rx="3.2" fill="#fff8e7" stroke="#794f27" />
      <path stroke="#794f27" strokeWidth="2.2" d="M8.8 7.6h6.4" />
      <path stroke="#794f27" strokeWidth="2.6" d="M8.7 11.8h.1M12 11.8h.1M15.3 11.8h.1M8.7 15.5h.1M12 15.5h.1M15.3 15.5h.1" />
    </>
  ),
  language: (
    <>
      <rect x="4.3" y="5.2" width="15.4" height="13.6" rx="3" fill="#fff8e7" stroke="#794f27" />
      <path stroke="#794f27" strokeWidth="2.1" d="M7.2 9.1h6M10.2 9.1c-.2 3.4-1.5 5.7-3.7 7.3M8.1 12c1.4 1.9 3.3 3 5.4 3.5" />
      <path stroke="#794f27" strokeWidth="1.9" d="M14.7 16.2l2.3-5.6 2.4 5.6M15.5 14.4h3" />
    </>
  ),
  performance: (
    <>
      <path fill="#fff8e7" stroke="#794f27" d="M6 6.8c2.3-1.2 4.3-1 6 .4v8.5c-1.8-1.2-3.8-1.3-6-.2z" />
      <path fill="#fff8e7" stroke="#794f27" d="M18 6.8c-2.3-1.2-4.3-1-6 .4v8.5c1.8-1.2 3.8-1.3 6-.2z" />
      <path stroke="#794f27" strokeWidth="2.1" d="M7.2 19c3.2 2.2 6.4 2.2 9.6 0M8.7 10.3h1.7M13.6 10.3h1.7" />
    </>
  ),
  broom: (
    <>
      <path stroke="#794f27" strokeWidth="2.5" d="M14 4.2l5.8 5.8" />
      <path fill="#fff8e7" stroke="#794f27" d="M12.7 6.2l5.1 5.1-7 7c-1.6 1.6-4.2 1.6-5.8 0l-.7-.7z" />
      <path stroke="#794f27" d="M5.3 18.1l5.1-5.1M7.7 19.3l4.2-4.2" />
    </>
  ),
  run: (
    <>
      <circle cx="14.8" cy="4.9" r="2.1" fill="#fff8e7" stroke="#794f27" />
      <path stroke="#794f27" strokeWidth="2.25" d="M12 8.6l3.3 2.1-2.2 3.3 3.9 2.3M10 20l3-6.8M6 12l4-1.5 2-1.9M16 10.7l2.7-1.9" />
    </>
  ),
  moon: (
    <>
      <path fill="#fff8e7" stroke="#794f27" d="M19 15.2A7.7 7.7 0 0 1 8.8 5a8.1 8.1 0 1 0 10.2 10.2z" />
      <path stroke="#794f27" d="M7.2 16.2c1 .7 2.1 1.1 3.4 1.2" />
    </>
  ),
  tidy: (
    <>
      <path fill="#fff8e7" stroke="#794f27" d="M4.7 9.5l7.3-4.7 7.3 4.7v9.4H4.7z" />
      <path stroke="#794f27" strokeWidth="2" d="M8.2 9.8V7.2h7.6v2.6M8.2 13h7.6M8.2 16h5.1" />
    </>
  ),
};

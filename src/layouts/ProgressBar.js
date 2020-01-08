import React from 'react';
import cx from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import styles from './ProgressBar.less';

export default function ProgressBar({ activeKey }) {
  const STEPS = [
    {
      key: 'scan',
      title: formatMessage({ id: 'lianmed.step1' }),
    },
    {
      key: 'measurement',
      title: formatMessage({ id: 'lianmed.step2' }),
    },
    {
      key: 'result',
      title: formatMessage({ id: 'lianmed.step3' }),
    },
  ];
  return (
    <ul className={styles.wrap}>
      {STEPS.map((e, i) => {
        const isActive = e.key.includes(activeKey);
        return (
          <li id={e.key} key={e.key} className={cx(styles.item, { [styles.active]: isActive })}>
            <span className={styles.step}>{i + 1}</span>
            <span className={styles.text}>{e.title}</span>
          </li>
        );
      })}
    </ul>
  );
}


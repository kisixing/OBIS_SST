import React, { useState, useEffect } from 'react';
import { Button, Toast, Modal } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import router from 'umi/router';
import styles from './index.less';

const alert = Modal.alert;
const GRADES = [
  {
    label: '低血压',
    key: 'lower',
    min: [0, 59],
    max: [0, 89],
    color: '#2B89F7'
  },
  {
    label: '正常',
    key: 'normal',
    min: [60, 90],
    max: [80, 140],
    color: '#80E680'
  },
  {
    label: '轻度高血压',
    key: 'higher',
    min: [91, 100],
    max: [140, 160],
    color: '#FF9900'
  },
  {
    label: '高血压',
    key: 'highest',
    min: [100, 999],
    max: [160, 999],
    color: '#FF0000'
  },
];

export default function Result() {
  const [value, setValue] = useState([
    { label: '血压', value: '' },
    { lable: '心率', value: '' },
  ]);
  const [grade, setGrade] = useState('normal');
  const [loading, setLoading] = useState(false);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    setValue([
      { label: '血压', value: ['78', '128'] },
      { lable: '心率', value: '88' },
    ]);
    return function cleanup() {

    };
  }, []);

  // 重新测量血压
  const remeasure = () => {
    alert(formatMessage({ id: 'lianmed.prompt' }), '确定返回测量界面重新测量血压?', [
      {
        text: formatMessage({ id: 'lianmed.cancel' }),
        onPress: () => console.log('cancel'),
        style: 'default',
      },
      {
        text: formatMessage({ id: 'lianmed.confirm' }),
        onPress: () => {
          router.push('/measurement');
        },
      },
    ]);
  };

  const onSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Toast.success('保存成功！');
    }, 1000);
  };

  return (
    <div className={styles.page}>
      <ul className={styles.grade}>
        {GRADES.map(e => {
          const color = e.color;
          return (
            <li key={e.key} className={styles.item}>
              <div
                className={styles.bubble}
                style={{ borderColor: color, display: 'inline-block' }}
              >
                {e.label}
              </div>
              <div
                className={styles.arrow}
                style={{ borderTopColor: color, display: 'inline-block' }}
              />
              <div className={styles.colorlump} style={{ backgroundColor: color }} />
            </li>
          );
        })}
      </ul>
      <div className={styles.score}>
        <span style={{ marginRight: '0.4rem' }}>
          {formatMessage({ id: 'lianmed.BloodPressure' })}：{'127/87'}{' '}
          <span className={styles.unit}>mmHg</span>
        </span>
        <span>
          {formatMessage({ id: 'lianmed.HeartRate' })}：{'88'}{' '}
          <span className={styles.unit}>times/min</span>
        </span>
      </div>
      <div className={styles.buttonView}>
        <Button inline type="ghost" onClick={remeasure}>
          {formatMessage({ id: 'lianmed.remeasure' })}
        </Button>
        <Button inline type="primary" loading={loading} onClick={onSave}>
          {formatMessage({ id: 'lianmed.save' })}
        </Button>
      </div>
    </div>
  );
}

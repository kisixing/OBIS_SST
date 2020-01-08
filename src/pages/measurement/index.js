import React, { useState } from 'react';
import { Modal, Button } from 'antd-mobile';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import CountDown from '../../components/CountDown';

import gif from '../../assets/timg.jpg';
import styles from './index.less';

const alert = Modal.alert;

export default function Measurement() {
  const [measuring, setMeasuring] = useState(false);
  const targetTime = new Date().getTime() + 1000 * 30;
  const goBack = () => {
    alert(formatMessage({ id: 'lianmed.prompt' }), '确定返回扫描界面重新绑定孕妇?', [
      {
        text: formatMessage({ id: 'lianmed.cancel' }),
        onPress: () => console.log('cancel'),
        style: 'default',
      },
      {
        text: formatMessage({ id: 'lianmed.confirm' }),
        onPress: () => {
          router.push('/scan');
        },
      },
    ]);
  }

  const onEnd = () => {
    console.log('count down!!!');
    router.push('/result');
  }

  return (
    <div className={styles.page}>
      {measuring ? (
        <div className={styles.countDown}>
          <CountDown
            format={time => {
              const hours = 60 * 60 * 1000;
              const minutes = 60 * 1000;

              const h = Math.floor(time / hours);
              const m = Math.floor((time - h * hours) / minutes);
              const s = Math.floor((time - h * hours - m * minutes) / 1000);
              const SS = m * 60 + s;

              const fixedZero = val => (val * 1 < 10 ? `0${val}` : val);
              return <span className={styles.time}>{fixedZero(SS)}</span>;
            }}
            target={targetTime}
            onEnd={onEnd}
          />
          <p>xxx {formatMessage({ id: 'lianmed.measuringTip' })}</p>
        </div>
      ) : (
        <div className={styles.operationTip}>
          <div className={styles.left}>
            <h2>X X X，你好！</h2>
            <p>我们可以开始测量血压了~</p>
            <p>请点击血压测量设备的开始按钮</p>
            <Button
              type="primary"
              inline
              size="small"
              style={{ marginTop: '1.2rem' }}
              onClick={goBack}
            >
              {formatMessage({ id: 'lianmed.back' })}
            </Button>
          </div>
          <div className={styles.right}>
            <img alt="gif" src={gif} />
          </div>
        </div>
      )}
    </div>
  );
}

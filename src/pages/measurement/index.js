import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Modal, Toast, Button } from 'antd-mobile';
import Router from 'umi/router';
import { formatMessage } from 'umi-plugin-locale';
import CountDown from '../../components/CountDown';

import gif from '../../assets/timg2.png';
import styles from './index.less';

const alert = Modal.alert;

function Measurement({ dispatch, global: { user, bufferString, checkCompleted, socketState } }) {
  // const { id, name } = location.query;
  const [measuring, setMeasuring] = useState(false);
  const targetTime = new Date().getTime() + 1000 * 30;

  useEffect(() => {
    // effect;
    return () => {
      dispatch({
        type: 'blobal/updateState',
        payload: {
          checkCompleted: false,
        },
      });
    };
  }, []);

  const goBack = () => {
    alert(
      formatMessage({
        id: 'lianmed.prompt',
      }),
      '确定返回扫描界面重新绑定孕妇?',
      [
        {
          text: formatMessage({
            id: 'lianmed.cancel',
          }),
          onPress: () => console.log('cancel'),
          style: 'default',
        },
        {
          text: formatMessage({
            id: 'lianmed.confirm',
          }),
          onPress: () => {
            dispatch({
              type: 'global/updateState',
              payload: {
                user: {},
                result: [],
                buffer: [],
              },
            });
            Router.push('/scan');
          },
        },
      ],
    );
  };

  const onEnd = () => {
    Router.push('/result');
  };

  const handleStart = () => {
    // 0x02 0x53 0x03
    // const str = byteToString([0x02, 0x53, 0x03]);

    window.websocketServices.send(
      JSON.stringify({
        name: 'blood',
        data: 'start',
      }),
    );
  };

  // 字节序列转ASCII码
  // [0x24, 0x26, 0x28, 0x2A] ==> "$&C*"
  function byteToString(arr) {
    if (typeof arr === 'string') {
      return arr;
    }
    var str = '',
      _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
      var one = _arr[i].toString(2),
        v = one.match(/^1+?(?=0)/);
      if (v && one.length === 8) {
        var bytesLength = v[0].length;
        var store = _arr[i].toString(2).slice(7 - bytesLength);
        for (var st = 1; st < bytesLength; st++) {
          store += _arr[st + i].toString(2).slice(2);
        }
        str += String.fromCharCode(parseInt(store, 2));
        i += bytesLength - 1;
      } else {
        str += String.fromCharCode(_arr[i]);
      }
    }
    return str;
  }

  //字符串转字节序列
  function stringToByte(str) {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for (var i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if (c >= 0x010000 && c <= 0x10ffff) {
        bytes.push(((c >> 18) & 0x07) | 0xf0);
        bytes.push(((c >> 12) & 0x3f) | 0x80);
        bytes.push(((c >> 6) & 0x3f) | 0x80);
        bytes.push((c & 0x3f) | 0x80);
      } else if (c >= 0x000800 && c <= 0x00ffff) {
        bytes.push(((c >> 12) & 0x0f) | 0xe0);
        bytes.push(((c >> 6) & 0x3f) | 0x80);
        bytes.push((c & 0x3f) | 0x80);
      } else if (c >= 0x000080 && c <= 0x0007ff) {
        bytes.push(((c >> 6) & 0x1f) | 0xc0);
        bytes.push((c & 0x3f) | 0x80);
      } else {
        bytes.push(c & 0xff);
      }
    }
    return bytes;
  }

  // const insertRecord = () => {
  //   dispatch({
  //     type: 'global/insertBgRecord',
  //     payload: {
  //       userid: '',
  //       date: '', // string
  //       diastolicpressure: '', // 舒张压
  //       shrinkpressure: '', // 高血压
  //     },
  //   }).then(res => {
  //     if (res && res.code === '1') {
  //       Toast.info('血压保存成功!');
  //     }
  //   });
  // };

  return (
    <div className={styles.page}>
      {checkCompleted ? (
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
          <p>
            xxx{' '}
            {formatMessage({
              id: 'lianmed.measuringTip',
            })}
          </p>
        </div>
      ) : (
        <div className={styles.operationTip}>
          <div className={styles.left}>
            <h2>{user.name} 你好！</h2>
            <p>
              我们可以开始测量血压了，请根据
              <strong
                style={{
                  color: '#f00',
                }}
              >
                语音提示
              </strong>
              操作。
            </p>
            <p>1、请点击血压测量设备的开始按钮</p>
            <p>2、开始测量后，请保持姿势，耐心等待测量结果。</p>
            <Button
              inline
              size="small"
              style={{
                marginTop: '1.2rem',
                marginRight: 24,
              }}
              onClick={goBack}
            >
              {formatMessage({
                id: 'lianmed.back',
              })}
            </Button>
            <Button inline type="primary" disabled={socketState !== 1} onClick={handleStart}>
              开始测量
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

export default connect(({ global }) => ({
  global,
}))(Measurement);

import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, Modal, Toast } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import Router from 'umi/router';
import CountDown from '@/components/CountDown';
import styles from './index.less';

const alert = Modal.alert;
const GRADES = [
  {
    label: '低血压',
    key: 'lower',
    tips: '血压偏低，请休息5~10分钟后再次测量。',
    min: [0, 59],
    max: [0, 89],
    color: '#2B89F7'
  },
  {
    label: '正常',
    key: 'normal',
    tips: '血压正常，请继续保持。',
    min: [60, 90],
    max: [80, 140],
    color: '#80E680'
  },
  {
    label: '轻度高血压',
    tips: '血压偏高，请休息5~10分钟后再次测量。',
    key: 'higher',
    min: [90, 100],
    max: [140, 160],
    color: '#FF9900'
  },
  {
    label: '高血压',
    tips: '血压偏高，请休息5~10分钟后再次测量。',
    key: 'highest',
    min: [100, 999],
    max: [160, 999],
    color: '#FF0000'
  },
];

function Result({ dispatch, result, user }) {
  const [count, setCount] = useState(5);
  const [value, setValue] = useState([
    { label: '血压', value: [] },
    { lable: '心率', value: '' },
  ]);
  const [grade, setGrade] = useState(GRADES[1]);
  const [loading, setLoading] = useState(false);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    if (result.length) {
      const hBP = result[4].replace(/\b(0+)/gi, '');
      const lBP = result[6].replace(/\b(0+)/gi, '');
      const rate = result[7].replace(/\b(0+)/gi, '');
      judgeGrade(hBP * 1, lBP * 1);
      setValue([
        {
          label: '血压',
          value: [hBP, lBP],
        },
        { lable: '心率', value: rate },
      ]);
    }

    const tick = () => {
      if (user && user.id && count === 0) {
        onSave();
      }
      const second = count - 1;
      return setCount(second)
    }
    const interval = setInterval(() => tick(), 1000);

    return function cleanup() {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [result, count]);

  // 判断血压是否在正常
  const judgeGrade = (h, l) => {
    let index = 1; // 正常血压
    // if ((h >= 90 && h <= 140) && (l >= 60 && l <= 90)) {
    //   index = 1;
    // } else {

    // }
    if (h < 90 || l < 60) {
      // 低血压
      index = 0;
    }
    if ((h > 140 && h < 160) || (l > 90 && l < 100)) {
      // 轻度高血压
      index = 2;
    }
    if (h >= 160 || l >= 100) {
      //高血压
      index = 3;
    }

    // console.log('object', GRADES[index]);
    setGrade(GRADES[index])
  }
  // judgeGrade();

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
          Router.push('/measurement');
        },
      },
    ]);
  };

  const onSubmit = () => {
    setCount(-1)
    onSave()
  }

  const onSave = () => {
    setLoading(true);
    if (!result.length) {
      setLoading(false);
      return Toast.info('您还未测试血压！')
    }
    dispatch({
      type: 'global/insertBgRecord',
      payload: {
        userid: user.id,
        date: moment(result[2] + ' ' + result[3]).format('YYYY-MM-DD HH:mm:ss'),
        // shrinkpressure: result[4].replace(/\b(0+)/gi, ''),
		    // diastolicpressure: result[6].replace(/\b(0+)/gi, ''),
        // heartrate: result[7].replace(/\b(0+)/gi, ''),
        shrinkpressure: value[0]['value'][0],
        diastolicpressure: value[0]['value'][1],
        heartrate: value[1]['value']
      },
    }).then(res => {
      if (res && res.code === '1') {
        setLoading(false);
        countDown();
      }
    });
  };

  const countDown = () => {
    let secondsToGo = 10;
    const alertInstance = alert(
      '提示',
      <div>
        保存成功，{grade.tips}
        <CountDown
          target={new Date().getTime() + secondsToGo * 1000}
          format={e => <span>{moment(e).format('ss')}</span>}
        />
        s后关闭
      </div>,
      [
        {
          text: '确定',
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
    setTimeout(() => {
      alertInstance.close();
      Router.push('/scan');
    }, secondsToGo * 1000);
  }

  const backHome = () => {
    dispatch({
      type: 'global/updateState',
      payload: {
        user: {},
        result: [],
        buffer: [],
      },
    });
    Router.push('/scan');
  }

  return (
    <div className={styles.page}>
      <ul className={styles.grade}>
        {GRADES.map(e => {
          const color = e.color;
          const isShow = e.key === grade.key;
          return (
            <li key={e.key} className={styles.item}>
              <div
                className={styles.bubble}
                style={{ borderColor: color, display: isShow ? 'flex' : 'none' }}
              >
                {e.label}
              </div>
              <div
                className={styles.arrow}
                style={{ borderTopColor: color, display: isShow ? 'inline-block' : 'none' }}
              />
              <div className={styles.colorlump} style={{ backgroundColor: color }} />
            </li>
          );
        })}
      </ul>
      <div className={styles.score}>
        <span style={{ marginRight: '0.4rem' }}>
          {formatMessage({ id: 'lianmed.BloodPressure' })}：
          {value[0]['value'][0]} / {value[0]['value'][1]}
          <span className={styles.unit}>mmHg</span>
        </span>
        <span>
          {formatMessage({ id: 'lianmed.HeartRate' })}：{value[1]['value']}{' '}
          <span className={styles.unit}>次/分钟</span>
        </span>
      </div>
      <div className={styles.buttonView}>
        <Button inline type="ghost" onClick={remeasure}>
          {formatMessage({ id: 'lianmed.remeasure' })}
        </Button>
        {user && user.id ? (
          <Button
            inline
            type="primary"
            loading={loading}
            disabled={loading} //  || !value[1]['value']
            onClick={onSubmit}
          >
            {formatMessage({ id: 'lianmed.save' })}
            {count && count > 0 ? `（${count}S）` : ''}
          </Button>
        ) : (<Button inline type="primary" onClick={backHome}>返回首页</Button>)}
      </div>
    </div>
  );
}

export default connect(({ global }) => ({
  result: global.result,
  user: global.user,
}))(Result);

import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, Modal } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import Router from 'umi/router';
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

function Result({ dispatch, result, user }) {
  const [value, setValue] = useState([
    { label: '血压', value: [] },
    { lable: '心率', value: '' },
  ]);
  const [grade, setGrade] = useState('normal');
  const [loading, setLoading] = useState(false);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    if (result.length) {
      console.log('结果', result);
      setValue([
        {
          label: '血压',
          value: [result[4].replace(/\b(0+)/gi, ''), result[6].replace(/\b(0+)/gi, '')],
        },
        { lable: '心率', value: result[7].replace(/\b(0+)/gi, '') },
      ]);
    }

    return function cleanup() {};
  }, [result]);

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

  const onSave = () => {
    setLoading(true);
    dispatch({
      type: 'global/insertBgRecord',
      payload: {
        userid: user.id,
        date: moment(result[2] + ' ' + result[3]).format('YYYY-MM-DD HH:mm:ss'),
        diastolicpressure: result[6].replace(/\b(0+)/gi, ''),
        shrinkpressure: result[4].replace(/\b(0+)/gi, ''),
        heartrate: result[7].replace(/\b(0+)/gi, ''),
      },
    }).then(res => {
      if (res && res.code === '1') {
        setLoading(false);
        alert('提示', '数据保存成功', [
          { text: '确定', onPress: () => {
            dispatch({
              type: 'global/updateState',
              payload: {
                user: {},
                result: [],
                buffer: [],
              },
            });
            Router.push('/scan');
          } },
        ]);
      }
    });
  };

  return (
    <div className={styles.page}>
      <ul className={styles.grade}>
        {GRADES.map(e => {
          const color = e.color;
          const isShow = e.key === grade;
          return (
            <li key={e.key} className={styles.item}>
              <div
                className={styles.bubble}
                style={{ borderColor: color, display: isShow ? 'inline-block' : 'none' }}
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
        <Button inline type="primary" loading={loading} disabled={!result} onClick={onSave}>
          {formatMessage({ id: 'lianmed.save' })}
        </Button>
      </div>
    </div>
  );
}

export default connect(({ global }) => ({
  result: global.result,
  user: global.user,
}))(Result);

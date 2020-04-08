/* eslint-disable jsx-a11y/anchor-is-valid */
/**
 * layout布局 header conten footer
 */
import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'dva';
import { Modal, List, InputItem, Toast, ActivityIndicator } from 'antd-mobile';
import { formatMessage, getLocale, setLocale } from 'umi-plugin-locale';
import Socket from '../utils/webSocket';
import Clock from '../components/Clock';
import ProgressBar from './ProgressBar';

import logo from '../assets/logo.png';
import styles from './BasicLayout.less';

function BasicLayout(props) {
  const initLocale = getLocale();
  const [language, setLanguage] = useState(initLocale);
  const [stage, setStage] = useState(false);

  // 获取当前current key
  const pathname = props.location.pathname;
  const key = pathname ? pathname.substr(1) : '';

  useEffect(() => {
    let s = null;
    // TODO
    s = createSocket();
    return () => {
      if (stage) {
        s.close();
      }
    };
  }, [])

  const onWrapTouchStart = e => {
    // fix touch to scroll background page on iOS
    if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
      return;
    }
    const pNode = closest(e.target, '.am-modal-content');
    if (!pNode) {
      e.preventDefault();
    }
  };

  function closest(el, selector) {
    const matchesSelector =
      el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
      if (matchesSelector.call(el, selector)) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  // 切换语言
  const onLocaleChange = () => {
    if (language === 'zh-CN') {
      setLocale('en-US');
      setLanguage('en-US');
    } else {
      setLocale('zh-CN');
      setLanguage('zh-CN');
    }
  };

  // 创建websocket连接
  const createSocket = () => {
    // const socketService = localStorage.getItem('lianmed_web_socket');
    // const params = {
    //   clientType: 'ctg-suit',
    //   token: 'eyJ1c2VybmFtZSI6ICJhZG1pbiIsInBhc3N3b3JkIjogImFkbWluIn0=',
    // };
    // const socketUrl = `ws://${socketService}/?${stringify(params)}`;
    // const socketUrl = `ws://${socketService}`;
    const socket = new Socket({
      // socketUrl: socketUrl,
      timeout: 5000,
      socketClose: msg => {
        console.log(msg);
      },
      socketError: () => {
        setStage(false);
        Modal.alert('提示', '建立连接失败', [
          {
            text: '重新连接',
            onPress: () => {
              // 重试创建socket连接
              try {
                socket.connection();
              } catch (e) {
                // 捕获异常，防止js error
                console.log('异常连接', e);
              }
            },
          },
        ]);
      },
      socketOpen: () => {
        console.log('连接建立成功');
        setStage(true);
        // 心跳机制 定时向后端发数据
        // this.taskRemindInterval = setInterval(() => {
        //   this.socket.sendMessage({ msgType: 0 });
        // }, 30000);
      },
      socketMessage: receive => {
        const result = JSON.parse(receive.data);
        const { name, data } = result;
        if (name === 'QRcode') {
          const arr = data.split(/[=#]/);
          const userid = arr[1].slice(1, -1);
          if (checkQRCode()) {
            Toast.info('请使用围产保健-我的二维码')
          } else {
            getUSer(userid);
          }
        }
        if (name === 'SerialData') {
          pushSerialData(data);
          // console.log('object')
        }
      },
    });
    // 重试创建socket连接
    try {
      socket.connection();
    } catch (e) {
      // 捕获异常，防止js error
      console.log('异常连接', e);
    }
  };

  // 检验二维码的合法性
  const checkQRCode = string => {
    const res = /^Z([.*])J$/g;
    if (res.test(string)) {
      return true;
    } else {
      return false;
    }
  };

  const getUSer = (id) => {
    props.dispatch({
      type: 'global/getDocById',
      payload: id,
    });
  }

  const pushSerialData = (data) => {
    props.dispatch({
      type: 'global/instackBuffer',
      payload: data,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.left}>
          <img className={styles.logo} src={logo} alt="lian-med logo" />
          <span className={styles.title}>{formatMessage({ id: 'lianmed.title' })}</span>
        </div>
        {/* <a className={styles.locale} onClick={onLocaleChange}>
          {language === 'zh-CN' ? 'ENGLISH' : '中文'}
        </a> */}
      </div>
      <div className={styles.content}>
        <div className={styles.clock}>
          <span className={styles.label}>{formatMessage({ id: 'lianmed.clock' })}</span>
          <Clock />
        </div>
        <div className={styles.progress}>
          <ProgressBar activeKey={key} />
        </div>
        <div className={styles.main}>{props.children}</div>
        {/* <div className={styles.copyright}>Copyright © 广州莲印医疗科技</div> */}
      </div>
      <ActivityIndicator toast text="Loading..." animating={!!props.submitting} />
    </div>
  );
}

export default connect(({ global, loading }) => ({
  global,
  submitting: loading.effects['global/getDocById'],
}))(BasicLayout);

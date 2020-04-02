/* eslint-disable jsx-a11y/anchor-is-valid */
/**
 * layout布局 header conten footer
 */
import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Modal, List, InputItem, Toast, ActivityIndicator } from 'antd-mobile';
import { formatMessage, getLocale, setLocale } from 'umi-plugin-locale';
import { stringify } from 'qs';
import Socket from '../utils/webSocket';
import Clock from '../components/Clock';
import ProgressBar from './ProgressBar';

import logo from '../assets/logo.png';
import styles from './BasicLayout.less';

function BasicLayout(props) {
  const initLocale = getLocale();
  // 检查storage是否存储了网络信息
  const webUrl = localStorage.getItem('lianmed_web_service');
  const socketUrl = localStorage.getItem('lianmed_web_socket');

  const [language, setLanguage] = useState(initLocale);
  const [stage, setStage] = useState(false);
  const [visible, setVisible] = useState(false);

  // 服务地址
  const [web, setWeb] = useState(webUrl);
  const [socket, setSocket] = useState(socketUrl);
  // 获取当前current key
  const pathname = props.location.pathname;
  const key = pathname ? pathname.substr(1) : '';

  useEffect(() => {
    if (web && socket) {
      createSocket();
    } else {
      // 设置网络
      setVisible(true);
    }
    return () => {
      Socket.onclose();
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

  const onSave = () => {
    if (web && socket) {
      localStorage.setItem('lianmed_web_service', web);
      localStorage.setItem('lianmed_web_socket', socket);
      createSocket();
      setVisible(false);
    } else {
      Toast.fail('请输入完整网络设置信息！');
    }
  };

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
    const socketService = localStorage.getItem('lianmed_web_socket');
    // const params = {
    //   clientType: 'ctg-suit',
    //   token: 'eyJ1c2VybmFtZSI6ICJhZG1pbiIsInBhc3N3b3JkIjogImFkbWluIn0=',
    // };
    // const socketUrl = `ws://${socketService}/?${stringify(params)}`;
    const socketUrl = `ws://${socketService}`;
    const socket = new Socket({
      socketUrl: socketUrl,
      timeout: 15000,
      socketClose: msg => {
        console.log(msg);
      },
      socketError: () => {
        setStage(false);
        console.log(stage + '连接建立失败');
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
          getUSer(userid);
        }
        if (name === 'SerialData') {
          pushSerialData(data);
          console.log('object')
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
        <a href="#" className={styles.left}>
          <img className={styles.logo} src={logo} alt="lian-med logo" />
          <span className={styles.title}>{formatMessage({ id: 'lianmed.title' })}</span>
        </a>
        <a className={styles.locale} href="#" onClick={onLocaleChange}>
          {language === 'zh-CN' ? 'ENGLISH' : '中文'}
        </a>
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
        <div className={styles.copyright}>Copyright © 广州莲印医疗科技</div>
      </div>
      <Modal
        visible={visible}
        transparent
        maskClosable={false}
        onClose={() => setVisible(false)}
        title="网络设置"
        className={styles.modal}
        footer={[
          {
            text: '保存',
            onPress: onSave,
          },
        ]}
        wrapProps={{ onTouchStart: onWrapTouchStart }}
        afterClose={() => {
          // alert('afterClose');
        }}
      >
        <List>
          <InputItem clear placeholder="web service..." onChange={value => setWeb(value)}>
            web
          </InputItem>
          <InputItem clear placeholder="socket service..." onChange={value => setSocket(value)}>
            socket
          </InputItem>
        </List>
      </Modal>
      <ActivityIndicator toast text="Loading..." animating={!!props.submitting} />
    </div>
  );
}

export default connect(({ global, loading }) => ({
  global,
  submitting: loading.effects['global/getDocById'],
}))(BasicLayout);

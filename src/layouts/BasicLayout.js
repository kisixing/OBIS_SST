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
import { render } from 'react-dom';

class BasicLayout extends React.Component {
  constructor(props) {
    super();
    this.state = {
      language: getLocale(),
    };
    this.taskRemindInterval = null;
    this.websocketServices = null;
    // 获取当前current key
    const pathname = props.location.pathname;
    this.key = pathname ? pathname.substr(1) : '';
  }

  componentDidMount() {
    this.createSocket();
    // this.socket = new Socket({
    //   socketUrl: `ws://${window.configuration.ws}`,
    //   timeout: 5000,
    //   socketMessage: receive => {
    //     console.log(receive); //后端返回的数据，渲染页面
    //   },
    //   socketClose: msg => {
    //     console.log(msg);
    //   },
    //   socketError: () => {
    //     console.log(this.state.taskStage + '连接建立失败');
    //   },
    //   socketOpen: () => {
    //     console.log('连接建立成功');
    //     // 心跳机制 定时向后端发数据
    //     this.taskRemindInterval = setInterval(() => {
    //       this.socket.sendMessage({ msgType: 0 });
    //     }, 30000);
    //   },
    // });

    // // 重试创建socket连接;
    // try {
    //   this.socket.connection();
    // } catch (e) {
    //   // 捕获异常，防止js error
    //   // donothing
    // }
  }

  componentWillUnmount() {
    this.websocketServices && this.websocketServices.onclose();
  }

  // 切换语言
  onLocaleChange = () => {
    if (this.state.language === 'zh-CN') {
      setLocale('en-US');
      this.setState({ language: 'en-US' });
    } else {
      setLocale('zh-CN');
      this.setState({ language: 'zh-CN' });
    }
  };

  // 创建websocket连接
  createSocket = () => {
    // const socketService = localStorage.getItem('lianmed_web_socket');
    // const params = {
    //   clientType: 'ctg-suit',
    //   token: 'eyJ1c2VybmFtZSI6ICJhZG1pbiIsInBhc3N3b3JkIjogImFkbWluIn0=',
    // };
    // const socketUrl = `ws://${socketService}/?${stringify(params)}`;
    const socketUrl = `ws://${window.configuration.ws}`;
    this.websocketServices = new Socket({
      socketUrl: socketUrl,
      timeout: 5000,
      socketClose: msg => {
        // console.log(msg);
      },
      socketError: () => {
        Modal.alert('提示', '建立连接失败', [
          {
            text: '重新连接',
            onPress: () => {
              // 重试创建socket连接
              try {
                // this.websocketServices.connection();
                const origin = window.location.origin;
                window.location.href = `${origin}/#/scan`;
                window.location.reload();
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
        // 心跳机制 定时向后端发数据
        // this.taskRemindInterval = setInterval(() => {
        //   this.socket.sendMessage({ msgType: 0 });
        // }, 30000);
      },
      socketMessage: receive => {
        if (!receive.data.includes('{')) {
          return;
        }
        const result = JSON.parse(receive.data);

        const { name, data } = result;
        if (name === 'QRcode') {
          const arr = data.split(/[=#]/);

          const is = this.checkQRCode(arr[1]);
          if (!is) {
            Toast.info('请使用围产保健-我的二维码');
          } else {
            const userid = arr[1].slice(1, -1);
            this.getUser(userid);
          }
        }
        if (name === 'SerialData') {
          this.pushSerialData(data);
          // this.serialData(data);
        }
      },
    });
    // 重试创建socket连接
    try {
      this.websocketServices.connection();
    } catch (e) {
      // 捕获异常，防止js error
      console.log('异常连接', e);
    }
  };

  // 检验二维码的合法性
  checkQRCode = string => {
    const res = /^Z.*J$/g;
    if (res.test(string)) {
      return true;
    } else {
      return false;
    }
  };

  getUser = id => {
    this.props.dispatch({
      type: 'global/getDocById',
      payload: id,
    });
  };

  pushSerialData = data => {
    this.props.dispatch({
      type: 'global/instackBuffer',
      payload: data,
    });
  };

  serialData = data => {
    this.props.dispatch({
      type: 'global/getSerialData',
      payload: data,
    });
  };

  render() {
    const { language } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.left}>
            {/* <img className={styles.logo} src={logo} alt="lian-med logo" /> */}
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
            <ProgressBar activeKey={this.key} />
          </div>
          <div className={styles.main}>{this.props.children}</div>
          {/* <div className={styles.copyright}>Copyright © 广州莲印医疗科技</div> */}
        </div>
        <ActivityIndicator toast text="Loading..." animating={!!this.props.submitting} />
      </div>
    );
  }
}

export default connect(({ global, loading }) => ({
  global,
  submitting: loading.effects['global/getDocById'],
}))(BasicLayout);

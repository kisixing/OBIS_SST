/* eslint-disable jsx-a11y/anchor-is-valid */
/**
 * layout布局 header conten footer
 */
import React from 'react';
import { connect } from 'dva';
import { Modal, Toast, ActivityIndicator } from 'antd-mobile';
import { formatMessage, getLocale, setLocale } from 'umi-plugin-locale';
import ReconnectingWebSocket from 'reconnecting-websocket';
import moment from 'moment';
import Clock from '../components/Clock';
import ProgressBar from './ProgressBar';

import styles from './BasicLayout.less';

class BasicLayout extends React.Component {
  constructor(props) {
    super();
    this.state = {
      language: getLocale(),
    };
    this.taskRemindInterval = null;
    // 获取当前current key
    const pathname = props.location.pathname;
    this.key = pathname ? pathname.substr(1) : '';
  }

  componentDidMount() {
    // 登录操作
    this.props.dispatch({
      type: 'global/login',
      payload: {
        username: 'admin',
        password: 'admin',
      },
    });
    this.createSocket();
    // ZJ#就诊卡号#姓名#身份证号码#出生日期#末次月经#孕次#产次#手机号码#生成二维码时间
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
  createSocket = async () => {
    const options = {
      connectionTimeout: 1000,
      maxRetries: 10000,
    };
    const socketUrl = `ws://${window.configuration.ws}`;
    const rws = await new ReconnectingWebSocket(socketUrl, [], options);
    rws.addEventListener('open', e => {
      console.log('websocket连接建立成功');
      this.props.dispatch({
        type: 'global/updateState',
        payload: {
          socketState: e.target.readyState,
        },
      });
    });
    rws.addEventListener('message', e => {
      console.log('-----------message ws信息-------------', e.data);
      if (!e.data.includes('{')) {
        return;
      }
      const result = JSON.parse(e.data);

      const { name, data } = result;
      if (name === 'QRcode') {
        if (data === 'www.vguang.cn') {
          return console.log('---心跳---');
        }
        console.log('扫码信息ws data -->', data);
        const res = /^Z.*J$/g;
        const arr = data.split(/[=#]/);
        const index = arr.findIndex(e => res.test(e));
        // const is = this.checkQRCode(arr[index]);
        if (index === -1) {
          return Toast.info('请使用围产保健-我的二维码');
        }
        if (
          moment().format('YYYY-MM-DD') !== moment(Number(arr[arr.length - 1])).format('YYYY-MM-DD')
        ) {
          // 二维码仅限于当天生成的
          return Toast.info('请更新二维码');
        }
        const userid = arr[index].slice(1, -1);
        this.getUser(userid);
      }
      if (name === 'SerialData') {
        console.log('测量数据ws data -->', data);
        this.pushSerialData(data);
        // this.serialData(data);
      }
    });

    rws.addEventListener('error', e => {
      // Modal.alert('提示', '建立连接失败', [
      //   {
      //     text: '重新连接',
      //     onPress: () => {
      //       // 重试创建socket连接
      //       try {
      //         // this.websocketServices.connection();
      //         const origin = window.location.origin;
      //         window.location.href = `${origin}/#/scan`;
      //         window.location.reload();
      //       } catch (e) {
      //         // 捕获异常，防止js error
      //         console.log('异常连接', e);
      //       }
      //     },
      //   },
      // ]);
      this.props.dispatch({
        type: 'global/updateState',
        payload: {
          socketState: e.target.readyState,
        },
      });
    });

    window.websocketServices = rws;
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
    // const { language } = this.state;
    const pathname = this.props.location.pathname;
    const key = pathname ? pathname.substr(1) : '';
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
            <ProgressBar activeKey={key} />
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

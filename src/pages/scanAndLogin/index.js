import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { InputItem, Modal, Toast, ActivityIndicator } from 'antd-mobile';
import { formatMessage } from 'umi-plugin-locale';
import Router from 'umi/router';
import styles from './index.less';

function ScanAndLogin(props) {
  // 手机号码的存储是带格式化空格的
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Specify how to clean up after this effect:
    return function cleanup() {};
  }, []);

  const onErrorClick = () => {
    if (error) {
      Toast.info(formatMessage({ id: 'lianmed.phoneError' }));
    }
  };

  const gridClick = e => {
    // 是否可以继续输入
    // 清除空格
    e.preventDefault();
    const vv = phone.replace(/\s/g, '');
    const value = e.target.value;
    if (vv.length >= 11 || value == 12) {
      return;
    }
    let newPhone = phone.concat(value);
    if (newPhone.length === 3 || newPhone.length === 8) {
      newPhone += ' ';
    }
    setPhone(newPhone);
    const isPhone = /^1[3456789]\d{9}$/.test(newPhone.replace(/\s/g, ''));
    if (isPhone) {
      setError(false);
    } else {
      setError(true);
    }
  };

  const deleted = e => {
    e.stopPropagation();
    if (!phone) {
      return;
    }
    const newPhone = phone.substring(0, phone.length - 1);
    setPhone(newPhone);
    const isPhone = /^1[3456789]\d{9}$/.test(newPhone);
    if (isPhone || !newPhone) {
      setError(false);
    } else {
      setError(true);
    }
  };

  const getUser = mobile => {
    const { dispatch } = props;
    dispatch({
      type: 'global/getDocByMobile',
      payload: mobile,
    }).then(res => {
      if (res && res.id) {
        const data = { ...res };
        Router.push({
          pathname: '/measurement',
          query: {
            name: data.name,
            id: data.id,
          },
        });
        setLoading(false);
      } else {
        // Toast.info(res.message);
        Modal.alert('提示', `孕册${res.message}，请前往移动端建档。`, [
          { text: '确定', onPress: () => {} },
        ]);
      }
    });
  };

  const submit = e => {
    if (window.configuration.disabledMobile) {
      return Toast.info('请使用二维码！');
    }
    e.stopPropagation();
    // 清除空格
    const vv = phone.replace(/\s/g, '');
    if (!vv) {
      setError(true);
      return Toast.info(formatMessage({ id: 'lianmed.phonePlaceholder' }));
    }
    if (error) {
      return Toast.info(formatMessage({ id: 'lianmed.phoneError' }));
    }
    getUser(vv);
  };

  return (
    <div className={styles.page}>
      <div className={styles.scan}>
        {/* <h1>扫描二维码</h1> */}
        <div className={styles.innerBox}>
          <div className={styles.icon} />
        </div>
        <p>{formatMessage({ id: 'lianmed.scanTip' })}</p>
      </div>
      <div className={styles.separator} />
      <form className={styles.form}>
        {/* <div className={styles.label}>{formatMessage({ id: 'lianmed.phone' })}</div> */}
        <div className={styles.control}>
          <span className={styles.prefix} />
          <div>
            <InputItem
              disabled
              autoFocus
              type="phone"
              placeholder={formatMessage({ id: 'lianmed.phonePlaceholder' })}
              className={styles.input}
              value={phone}
              error={error}
              onErrorClick={onErrorClick}
              // onChange={onChange}
            />
          </div>
        </div>
        {/* <Button
          type="primary"
          size="small"
          loading={loading}
          disabled={loading}
          style={{ marginTop: '0.65rem' }}
          onClick={submit}
        >
          {formatMessage({ id: 'lianmed.confirm' })}
        </Button> */}
        <div className={styles.square}>
          <ul className={styles['square-inner']} onClick={gridClick}>
            <li value="1">1</li>
            <li value="2">2</li>
            <li value="3">3</li>
            <li value="4">4</li>
            <li value="5">5</li>
            <li value="6">6</li>
            <li value="7">7</li>
            <li value="8">8</li>
            <li value="9">9</li>
            <li value="11" onClick={deleted}>
              <svg
                t="1577758932671"
                className={styles.icon}
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="6689"
                width="128"
                height="128"
              >
                <path
                  d="M900.646 275.188H289.863a59.208 59.208 0 0 0-43.192 18.711L80.163 471.508c-21.348 22.772-21.348 58.213 0 80.985l166.508 177.609a59.208 59.208 0 0 0 43.192 18.711h610.783c32.561 0 59.203-26.642 59.203-59.203V334.391c0-32.561-26.642-59.203-59.203-59.203zM728.706 619.37c12.176 12.17 12.176 31.91 0 44.077-6.081 6.092-14.065 9.135-22.04 9.135-7.977 0-15.959-3.042-22.04-9.135l-93.683-93.683-93.683 93.683c-6.081 6.092-14.064 9.135-22.04 9.135-7.975 0-15.959-3.042-22.04-9.135-12.176-12.167-12.176-31.907 0-44.077l93.684-93.683-93.684-93.683c-12.176-12.17-12.176-31.91 0-44.081 12.163-12.174 31.918-12.174 44.081 0l93.683 93.686 93.683-93.686c12.163-12.174 31.918-12.174 44.081 0 12.176 12.17 12.176 31.911 0 44.081l-93.684 93.683 93.682 93.683z"
                  p-id="6690"
                  fill="#8a8a8a"
                ></path>
              </svg>
            </li>
            <li value="0">0</li>
            <li value="12" onClick={submit}>
              确定
            </li>
          </ul>
        </div>
        <ActivityIndicator toast text="Loading..." animating={loading} />
      </form>
    </div>
  );
}

export default connect(({ global, loading }) => ({
  global,
  submitting: loading.effects['global/getDocByMobile'],
}))(ScanAndLogin);

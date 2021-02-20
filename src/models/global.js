import { Modal, Toast } from 'antd-mobile';
import routerRedux from 'umi/router';
import { getDocById, getDocByMobile, insertBgRecord, auth } from '@/services/api';

function hexToString(str) {
  if (str.length % 2 !== 0) {
    return '';
  }
  let a;
  let string = [];
  for (var i = 0; i < str.length; i = i + 2) {
    a = parseInt(str.substr(i, 2), 16);
    string.push(String.fromCharCode(a));
  }
  return string.join('');
}

export default {
  namespace: 'global',

  state: {
    user: {},
    buffer: [],
    result: [],
    checkCompleted: false,
    socketState: 0,
    // CONNECTING 0 The connection is not yet open.
    // OPEN       1 The connection is open and ready to communicate.
    // CLOSING    2 The connection is in the process of closing.
    // CLOSED     3 The connection is closed or couldn't be opened
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(auth, payload);
      if (response && response.id_token) {
        sessionStorage.setItem('access_token', response.id_token);
      }
    },
    *getDocById({ payload }, { call, put }) {
      const response = yield call(getDocById, payload);
      if (response && response.id) {
        yield put({
          type: 'updateState',
          payload: {
            user: response,
          },
        });
        yield put(
          routerRedux.push({
            pathname: '/measurement',
            query: {
              name: response.name,
              id: response.id,
            },
          }),
        );
      }
      if (response && !response.id) {
        Toast.info('不存在的用户');
      }
    },
    *getDocByMobile({ payload }, { call, put }) {
      const response = yield call(getDocByMobile, payload);
      if (response && response.id) {
        yield put({
          type: 'updateState',
          payload: {
            user: response,
          },
        });
      }
      return response;
    },
    *getSerialData({ payload }, { call, put }) {
      const hex = payload;
      // const res = /^bp,9{20},[0-9]{4}\/[0-9]{2}\/[0-9]{2},[0-9]{2}:[0-9]{2},[0-9]{1,3},[0-9]{1,3},[0-9]{1,3},[0-9]{1,3},[0-9]{1}\n|\r/;
      if (hex.slice(0, 6) === '62702C' && hex.slice(-2) === '0D') {
        const string = hexToString(hex);
        const arr = string.split(',');
        // console.log('8888888', hex, string, arr)
        yield put({
          type: 'updateState',
          payload: {
            result: arr,
          },
        });
        yield put(routerRedux.push('/result'));
      } else {
        Modal.alert('提示', '测量失败，请重新测量', [
          {
            text: '确定',
            onPress: () => {
              put({
                type: 'updateState',
                payload: {
                  result: [],
                },
              });
            },
          },
        ]);
      }
    },
    *insertBgRecord({ payload }, { call, put }) {
      const response = yield call(insertBgRecord, payload);
      return response;
    },
    *instackBuffer({ payload }, { put, select }) {
      const user = yield select(_ => _.global.user);
      if (user && !user.id) {
        return;
      }
      let buffer = yield select(_ => _.global.buffer);
      buffer.push(payload);
      const hex = buffer.join('');
      // console.log('-----123-----', hex);
      const res = /^ID9{20}B[0-9]{2}\/[0-9]{2}\/[0-9]{2},[0-9]{2}:[0-9]{2}[0-9]{1}[0-9]{3}[0-9]{1}[0-9]{3}[0-9]{1}[0-9]{3}[0-9]{1}\n|\r/;
      if (hex.length === 80 && hex.slice(0, 6) === '024944' && hex.slice(-2) === '03') {
        const string = hexToString(hex);
        if (hex.length !== 80) {
          Modal.alert('提示', '测量失败，请重新测量', [
            {
              text: '确定',
              onPress: () => {
                put({
                  type: 'updateState',
                  payload: {
                    result: [],
                    buffer: [],
                  },
                });
              },
            },
          ]);
        } else {
          const arr = string.split(' ');
          // console.log('-----456-----', string, arr);
          yield put({
            type: 'updateState',
            payload: {
              result: arr,
              buffer: [],
            },
          });
          yield put(routerRedux.push('/result'));
        }
      } else {
        yield put({
          type: 'updateState',
          payload: {
            buffer,
          },
        });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

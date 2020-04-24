import { Modal } from 'antd-mobile';
import routerRedux  from 'umi/router';
import { getDocById, getDocByMobile, insertBgRecord } from '@/services/api';

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
    checkCompleted: false
  },

  effects: {
    *getDocById({ payload }, { call, put }) {
      const response = yield call(getDocById, payload);
      if (response && response.code === '1') {
        yield put({
          type: 'updateState',
          payload: {
            user: response.object,
          },
        });
        yield put(
          routerRedux.push({
            pathname: '/measurement',
            query: {
              name: response.object.username,
              id: response.object.id,
            },
          }),
        );
      }
    },
    *getDocByMobile({ payload }, { call, put }) {
      const response = yield call(getDocByMobile, payload);
      if (response && response.code === '1') {
        yield put({
          type: 'updateState',
          payload: {
            user: response.object,
          },
        });
      }
      return response;
    },
    *getSerialData({ payload }, { call, put }) {
      const hex = payload;
      const reg = /^bp,9{20},[0-9]{4}\/[0-9]{2}\/[0-9]{2},[0-9]{2}:[0-9]{2},[0-9]{3},[0-9]{3},[0-9]{3},[0-9]{3}\,\d\r/;
      if (hex.slice(0, 6) === '62702C' && hex.slice(-2) === '0D') {
        const string = hexToString(hex);
        const arr = string.split(',');
        // console.log('8888888', hex, string, arr)
        yield put({
          type: 'updateState',
          payload: {
            result: arr,
          }
        })
        yield put(
          routerRedux.push('/result'),
        );
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
      let buffer = yield select(_ => _.global.buffer);
      buffer.push(payload);
      const hex = buffer.join('');
      const res = /^bp,9{20},[0-9]{4}\/[0-9]{2}\/[0-9]{2},[0-9]{2}:[0-9]{2},[0-9]{3},[0-9]{3},[0-9]{3},[0-9]{3}\,\d\r/;
      if (hex.slice(0, 6) === '62702C' && hex.slice(-2) === '0D') {
        const string = hexToString(hex);
        if (!res.test(string)) {
          Modal.alert('提示', '测量失败，请重新测量', [{ text: '确定', onPress: () => {
            put({
              type: 'updateState',
              payload: {
                result: [],
                buffer: [],
              },
            });
          } }]);
        } else {
          const arr = string.split(',')
          yield put({
            type: 'updateState',
            payload: {
              result: arr,
              buffer: []
            }
          })
          yield put(
            routerRedux.push('/result'),
          );
        }
      } else {
        yield put({
          type: 'updateState',
          payload: {
            buffer,
          }
        })
      }
    }
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

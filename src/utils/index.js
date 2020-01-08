import { Toast } from 'antd-mobile';

export function check(value) {
  return null
}

export function trim(str) {
  //删除左右两端的空格
  return str.replace(/(^\s*)|(\s*$)/g, ''); // 过滤首尾空格为空
}

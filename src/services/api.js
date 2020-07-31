// import { stringify } from 'querystring';
import request from '../utils/request';

const url = `http://${window.location.host}`;
const base_url = process.env.NODE_ENV === 'development' ? '' : url;

export async function getDocByMobile(mobile) {
  return request(`${base_url}/api/getDocByMobile?mobile=${mobile}`);
}

// api/get/useryc
export async function getDocById(id) {
  return request(`${base_url}/api/get/useryc?userid=${id}`);
}

export async function insertBgRecord(params) {
  return request(`${base_url}/api/insertBgRecord`, {
    method: 'POST',
    data: params,
  });
}

export async function auth(data) {
  return request(`${base_url}/api/authenticate`, {
    method: 'POST',
    data: {
      ...data
    },
  });
}

import { stringify } from 'querystring';
import request from '../utils/request';

const base_url = process.env.NODE_ENV === 'development' ? '' : `http://${localStorage.getItem('lianmed_web_service')}`;

export async function getDocByMobile(mobile) {
  return request(`${base_url}/api/getDocByMobile?mobile=${mobile}`);
}

// api/get/useryc
export async function getDocById(id) {
  return request(`${base_url}/api/get/useryc`, {
    method: 'POST',
    data: {
      userid: id,
    },
  });
}

export async function insertBgRecord(params) {
  return request(`${base_url}/api/insertBgRecord`, {
    method: 'POST',
    data: params,
  });
}

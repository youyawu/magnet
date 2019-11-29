import axios from 'axios';
import qs from 'qs';

const local = axios.create({
    baseURL: 'http://127.0.0.1:3000/'
});

const remote = axios.create({
    baseURL: '/oneportal',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },

    transformRequest: [function (data, headers) {
        return qs.stringify(data);
    }]
});
// local.interceptors.response.use(({ data }) => data);
// remote.interceptors.response.use(({ data }) => data);
export const Post = async <T>(url: string, obj = {}) => (await remote.post<T>(url, obj)).data;
export const post = async (url: string, obj = {}) => (await local.post(url, obj)).data;


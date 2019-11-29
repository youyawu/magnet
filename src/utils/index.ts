
export const parseDate = (s: string) => new Date(Date.parse(s.replace(/-/g, '/')));

export const getTimeSpan = (s: string | Date) => {
    const date = typeof s === 'string' ? parseDate(s) : s;
    const second = (new Date().getTime() - date.getTime()) / 1000;
    if (second < 60) {
        return second + '秒前';
    }
    if (second < 3600) {
        return Math.floor(second / 60) + '分钟前';
    }
    if (second < 3600 * 24) {
        return Math.floor(second / 60 / 60) + '小时前';
    }
    if (second < 24 * 3600 * 31) {
        return Math.floor(second / 60 / 60 / 24) + '天前';
    }
    if (second < 24 * 3600 * 31 * 12) {
        return Math.floor(second / 60 / 60 / 24 / 31) + '月前';
    }
    return Math.floor(second / 60 / 60 / 24 / 31 / 12) + '年前';
};

export const dateFormat = (s: string | Date, _fmt = 'yyyy-MM-dd hh:mm:ss') => {
    const date = typeof s === 'string' ? parseDate(s) : s;
    let fmt = _fmt;
    const o: {
        [index: string]: any
    } = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds() // 毫秒
    };

    if (/(y+)/.test(_fmt)) { fmt = fmt.replace(RegExp.$1, (String(date.getFullYear())).substr(4 - RegExp.$1.length)) }


    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr((String(o[k])).length)));
        }
    }
    return fmt;


};
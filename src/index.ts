import $ from 'jquery';
import { post, Post } from './utils/request';
import { getTimeSpan, dateFormat } from './utils';
import { debounce } from 'lodash';
import './styles';
import magnetManager from './modules/index';
interface IMsg {
    title: string,
    createDate: string,
    msgType: number,
    sendUserName: string
}
interface IMsgList {
    data: IMsg[]
    pageIndex: number
    pageTotal: number
    rowTotal: number
}
$(async () => {
    await Post('/loginSubmit', { loginId: 18337971872, loginPwd: 123456 });
    const container = $('.y-container'),
        gbimg = $('>.gbimg', container),
        themeSetting = $('.themeSetting', container).on('hidden', () => {
            themeSetting.addClass('hide');
            save(themeInfo);
            setTimeout(() => themeSetting.removeClass('hide'), 500);
        }),
        bgColors = Array.from($('.boxcolor:eq(0) li').map((i, item) => $(item).css('backgroundColor'))),
        save = debounce(x => post('/themeInfo/update', x), 1e3);
    const { themeInfo = {}, magnets }: any = await post('layout');
    themeInfo.bgColorIndex = themeInfo.bgColorIndex | 0;
    themeInfo.bgImgIndex = themeInfo.bgImgIndex | 0;
    themeInfo.hideImg = themeInfo.hideImg || false;
    magnets.forEach((x: any) => {
        x.row = x.row | 0;
        x.col = x.col | 0;
        x.rowSpan = x.rowSpan | 0;
        x.colSpan = x.colSpan | 0;
        x.bgColor = x.bgColor || bgColors[Math.floor(Math.random() * bgColors.length)];
        x.titleColor = x.titleColor || '#fff';
        x.titlePosition = x.titlePosition || 'bottom';
        x.titleFontSize = x.titleFontSize || '14px';
        x.titleAlign = x.titleAlign || 'center';
    });
    magnetManager.init(container, magnets);
    $(' .bgColor a', themeSetting).each((i, item) => {
        const a = $(item).click(() => {
            $('.glyphicon.glyphicon-ok', themeSetting).removeClass();
            a.addClass('glyphicon glyphicon-ok');
            container.css('background-color', a.css('background-color'));
            themeInfo.bgColorIndex = i;
            themeSetting.trigger('hidden');
            return false;
        });
        i === themeInfo.bgColorIndex && a.click();
    });
    $(' .bgImg img', themeSetting).each((i, item) => {
        const img = $(item).click(() => {
                gbimg.css({
                    backgroundImage: `url(${src})`
                });
                themeInfo.bgImgIndex = i;
                themeSetting.trigger('hidden');
            }),
            src = img.attr('src');
        i === themeInfo.bgImgIndex && img.click();
    });
    const bgimgdel = $('.bgImg input', themeSetting).click(e => {
        themeInfo.hideImg = (e.target as HTMLInputElement).checked;
        gbimg[themeInfo.hideImg ? 'removeClass' : 'addClass']('show');
        save(themeInfo);
    });
    themeInfo.hideImg || bgimgdel.click();
    $('.magnetManager', themeSetting).click(() => {
        themeSetting.trigger('hidden');
        magnetManager.showMask();
    });
    const userinfo = $('.userinfo').click(() => {
        const ul = userinfo.next().slideDown();
        $(document).one('click', () => {
            ul.slideUp();
        });
        return false;

    });
    const { data: msglist, rowTotal } = await Post<IMsgList>('/sysmsg/getSysMsgList', { isRead: false, pageIndex: 0, pageSize: 3 });
    const msgs_arr: JQuery<HTMLElement>[] = [];
    msglist.forEach((x: any) => {
        const li = $(`<li><a href="javascript:void(0);" ><div class="msg_title"><strong>${x.title}</strong>. <small>${getTimeSpan(x.createDate)}</small></div><small class="fl">${dateFormat(x.createDate, 'yyyy.MM.dd - hh:mm')}</small> <small class="fr">from:${x.msgType === 1 ? x.sendUserName : '系统消息'}</small></a></li>`);

        msgs_arr.push(li, $('<li>').addClass('divider'));
    });
    const msga = $('.msgs', container).prepend(msgs_arr).prev();
    if (rowTotal) { msga.append($('<span>').text(rowTotal)) }
});

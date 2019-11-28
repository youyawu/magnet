import $ from 'jquery';
import drag from './drag';
import grid from './grid';
import { debounce } from 'lodash';
import { post } from '../request';
export interface Magnet {
    id: string // 标示
    row: number, // 所在行
    col: number, // 所在列
    rowSpan: number, // 跨行 0表示未放置
    colSpan: number, // 跨列 0表示未放置
    bgColor: string, // 背景颜色
    icon: string, // 图标
    title: string, // 名称
    titleColor: string, // 字体颜色
    titlePosition: string, // 标题位置
    titleFontSize: string, // 标题字体大小
    titleAlign: string, // 标题对齐方式
    url: string,
    type: number, // 1 全屏 2半屏 3 新窗口
    refresh: boolean, // 是否刷新
    [index: string]: any
}
class MagnetManager {
    private dragWrapper: JQuery<HTMLElement> | null = null
    private dragContainer: JQuery<HTMLElement> | null = null
    private scrollContainer: JQuery<HTMLElement> | null = null
    private appContainer: JQuery<HTMLElement> | null = null
    private scrollBar: JQuery<HTMLElement> | null = null
    private tcDel: JQuery<HTMLElement> | null = null
    private tcEdit: JQuery<HTMLElement> | null = null
    private box: JQuery<HTMLElement> | null = null
    public dragWrapperWidth = 0
    private scrollWidth = 0
    private scrollBarWidth = 0
    private dragContainerHeight = 0
    public timer = 0
    private Magnets: JQuery<HTMLElement>[] = []
    public init(wrapper: JQuery<HTMLElement>, items: Magnet[]) {
        this.dragWrapper = wrapper.find('.content');
        this.appContainer = wrapper.find('.apps');
        this.dragContainer = wrapper.find('.content-container').mousedown(e => drag.containerDown(e));
        this.scrollContainer = this.dragContainer.next();
        this.scrollBar = this.scrollContainer.find('div');
        this.box = wrapper.find('.box');
        this.tcDel = this.dragContainer.find('>.tc.del');
        this.tcEdit = this.tcDel.next();
        this.bind();
        drag.init(this.dragContainer);
        grid.init(this.dragContainer.width()!, this.dragContainerHeight = this.dragContainer.height()!, Math.max(...items.map(({ col = 0, colSpan = 0 }) => col + colSpan)));
        items.forEach(x => this.initMagnet(x));
    }
    private initMagnet(magnet: Magnet) {
        if (!magnet.rowSpan) return this._initMagnet(magnet);
        grid.set(magnet, 1);
        const div = this.createMagnet(magnet),
            a = $(`<a target="_blank" href="${magnet.url}" >${magnet.title}</a>`).addClass(magnet.titlePosition).css({
                color: magnet.titleColor,
                textAlign: magnet.titleAlign,
                fontSize: magnet.titleFontSize
            }).click(() => magnet.type === 3 || !div.trigger('showBox')),
            i = $(`<i class="iconImg ${magnet.icon}" >`).on({
                fontsize_change() {
                    i.css({
                        fontSize: magnet.colSpan * grid.size * 0.4 + 'px'
                    });
                }
            });
        div.addClass('tmodel').css({
            background: magnet.bgColor,
            left: magnet.col * grid.size + 'px',
            top: magnet.row * grid.size + 'px'
        }).append(i, a, $('<div>').addClass('mask').append(
            $('<img src="./assets/imgs/imgset.png">').click(() => div.trigger('showTc', [this.tcEdit])),
            $('<img src="./assets/imgs/imgdel.png">').click(() => div.trigger('showTc', [this.tcDel]))
        ).hide()).on({
            dblclick: () => a.get(0).click(),
            mousedown: e => drag.targetDown(e),
            titleAlign_change(e, x) {
                a.css('textAlign', magnet.titleAlign = x);
                div.trigger('save');
            },
            titleFontSize_change(e, x) {
                a.css('fontSize', magnet.titleFontSize = x);
                div.trigger('save');
            },
            titlePosition_change(e, x) {
                a.removeClass().addClass(magnet.titlePosition = x);
                div.trigger('save');
            },
            titleColor_change(e, x) {
                a.css('color', magnet.titleColor = x);
                div.trigger('save');
            },
            bgColor_change(e, x) {
                div.css('background', magnet.bgColor = x).trigger('save');
            },
            rowSpan_change(e, x) {
                div.trigger('setSize', [x | 0, magnet.colSpan, true]);
            },
            colSpan_change(e, x) {
                div.trigger('setSize', [magnet.rowSpan, x | 0, true]);
                i.trigger('fontsize_change');
            }
        }).appendTo(this.dragContainer!);
        i.trigger('fontsize_change');
        this.Magnets.push(div);
        return div;
    }
    private _initMagnet(magnet: Magnet) {
        const div = this.createMagnet(magnet).append($('<i>').addClass(magnet.icon), magnet.title).mousedown(e => {
                div.addClass('addMagnet err').css({
                    left: div.offset()!.left,
                    top: div.position()!.top
                }).trigger('setSize', [2, 2]).appendTo(this.dragContainer!);
                li.remove();
                drag.targetDown(e);
            }),
            li = $('<li>').append(div).prependTo(this.appContainer!);
    }
    private createMagnet(magnet: Magnet) {
        const iframe = $('<iframe>').appendTo(this.box!);
        const div = $('<div>').on({
            clear: () => grid.set(magnet, 0),
            setPosition(e, { left, top }: { left: number, top: number }) {
                magnet.row = top / grid.size;
                magnet.col = left / grid.size;
                grid.set(magnet, 1);
                div.trigger('setTc');
            },
            setSize(e, rs: number, cs: number, reset = false) {
                div.trigger('clear');
                magnet.rowSpan = rs;
                magnet.colSpan = cs;
                grid.set(magnet, 1);
                reset && div.trigger('reset');
                div.trigger('setTc').hasClass('addMagnet') || div.trigger('save');
            },
            reset() {
                div.animate({
                    width: magnet.colSpan * grid.size - grid.Margin + 'px',
                    height: magnet.rowSpan * grid.size - grid.Margin + 'px',
                    left: magnet.col * grid.size + 'px',
                    top: magnet.row * grid.size + 'px',
                });
            },
            create: () => {
                if (div.remove().hasClass('err')) {
                    magnet.rowSpan = 0;
                    magnet.colSpan = 0;
                }
                this.Magnets.forEach((x, i) => x === div && this.Magnets.splice(i, 1));
                const newdiv = this.initMagnet(magnet);
                newdiv && newdiv.trigger('reset').trigger('save');
            },
            showMask() {
                div.find('.mask').fadeIn();
            },
            hideMask() {
                div.data('tc', null).find('.mask').fadeOut();
            },
            setTc() {
                const tc = div.data('tc') as JQuery<HTMLElement> | null;
                tc && tc.trigger('setPosition');
            },
            showTc: (e, tc: JQuery<HTMLElement>) => {
                div.data('tc', tc.data('magnet', null).trigger('init', magnet).data('magnet', div).trigger('setPosition'));
            },
            showBox: () => {
                if (magnet.type === 2) this.box!.addClass('t');
                if (!iframe.attr('src') || magnet.refresh) iframe.attr('src', magnet.url);
                iframe.show().siblings('iframe').hide();
                this.box!.fadeIn(800).addClass('open');
            },
            save: async () => {
                const { status } = await post('/magnets/update', magnet);
                status || alert('保存失败');
            }
        }).data('magnet', magnet);
        return div;
    }
    private bind() {
        this.box!.find('>.close').click(() => this.box!.removeClass('open').fadeOut(1e3, () => this.box!.removeClass('t')));
        this.tcDel!.find('button').click(() => !this.tcDel!.fadeOut(() => this.tcDel!.data('magnet', null))).last().click(() => {
            const div = this.tcDel!.data('magnet') as JQuery<HTMLElement> | null;
            div && div.data('tc', null).trigger('setSize', [0, 0]).trigger('create');
        });
        const magnets = $('[magnet]', this.tcEdit!.on({
            init(e, magnet: Magnet) {
                magnets.trigger('_init', magnet);
            },
            validate: () => {
                const div = this.tcEdit!.data('magnet') as JQuery<HTMLElement> | null,
                    magnet = div && div.data('magnet') as Magnet;
                if (!magnet) return;
                const { maxRows, maxCols } = grid.getMax(magnet),
                    selects = this.tcEdit!.find('select:lt(2)');
                selects.find('>').removeAttr('disabled');
                selects.each((i, item) => {
                    $(item).find(`>:gt(${i ? maxCols : maxRows - 1})`).attr('disabled', 'disabled');
                });
            }
        })).each((i, item) => {
            const $item = $(item).on({
                    save: (e, val) => {
                        const div = this.tcEdit!.data('magnet') as JQuery<HTMLElement> | null;
                        div && div.trigger(`${field}_change`, val);
                    }
                }),
                field = $item.attr('magnet')!;
            switch (item.tagName.toLowerCase()) {
                case 'p':
                    $item.on({
                        _init(e, { title }: Magnet) {
                            $item.text(title);
                        }
                    });
                    break;
                case 'select':
                    $item.on({
                        change: () => {
                            $item.trigger('save', $item.val());
                            this.tcEdit!.trigger('validate');
                        },
                        _init(e, { [field]: x }: Magnet) {
                            $item.val(x);
                        }
                    });

                    break;
                case 'div':
                    $('button', $item.on({
                        _init(e, { [field]: x }: Magnet) {
                            $item.find(`[data=${x}]`).click();
                        }
                    })).each((i, item) => {
                        const btn = $(item).click(() => {
                                btn.addClass('active').siblings().removeClass('active');
                                $item.trigger('save', data);
                            }),
                            data = btn.attr('data');
                    });
                    break;
                case 'ul':
                    $('li', $item.on({
                        _init(e, { [field]: x }: Magnet) {
                            $item.find('li').each((i, item) => {
                                const $item = $(item);
                                $item.css('background-color') === x && $item.click();
                            });
                        }
                    })).each((i, item) => {
                        const li = $(item).click(() => {
                            li.addClass('glyphicon glyphicon-ok').siblings().removeClass('glyphicon glyphicon-ok');
                            $item.trigger('save', li.css('background-color'));
                        });
                    });
                    break;
            }
        });
        [this.tcDel!, this.tcEdit!].forEach(tc => tc.on({
            setPosition: () => {
                const div = tc.data('magnet') as JQuery<HTMLElement> | null;
                if (!div) return;
                const magnet = div.data('magnet') as Magnet;
                const tc_w = tc.outerWidth(true)!,
                    tc_h = tc.outerHeight(true)!,
                    _left = div.offset()!.left!,
                    r = tc_w + _left + magnet.colSpan * grid.size < this.dragWrapperWidth,
                    mt = 16 + Math.max(magnet.row * grid.size - this.dragContainerHeight + tc_h, 0);
                tc.animate({
                    left: r ? (magnet.col + magnet.colSpan) * grid.size : magnet.col * grid.size - tc_w,
                    top: Math.min(magnet.row * grid.size, this.dragContainerHeight - tc_h)
                }, () => tc.find('.arrow')[r ? 'removeClass' : 'addClass']('r').css('marginTop', mt)).fadeIn(() => tc.trigger('validate')).siblings('.tc').fadeOut();

            }
        }));
        $(document).on({
            mousemove: e => drag.move(e),
            mouseup: e => drag.clear(e)
        });
        $(window).resize(debounce(() => {
            this.dragWrapperWidth = this.dragWrapper!.width()!;
            this.scrollWidth = this.scrollContainer!.width()!;
            grid.resize(this.dragContainerHeight = this.dragContainer!.height()!);
            this.Magnets.forEach(x => x.trigger('reset'));
        }, 300)).trigger('resize');
    }
    public moveContainerLeft() {
        let t = Math.min(this.dragContainer!.width()! - drag.oSelf!.width()! - parseInt(drag.oSelf!.css('left')), 10);
        this.dragContainer!.css('left', parseInt(this.dragContainer!.css('left')) - t);
        drag.oSelf!.css('left', drag.oSelf!.position().left + t);
        if (t < 10 && this.timer) {
            clearInterval(this.timer);
            this.timer = setInterval(this.resizeContainer.bind(this), 15);
        }
        grid.check();
        this.scroll();
    }
    public moveContainerRight() {
        const _left = parseInt(this.dragContainer!.css('left')),
            t = Math.min(Math.min(Math.abs(_left), 10), 10),
            left = _left + t;
        this.dragContainer!.css({ left });
        drag.oSelf!.css('left', parseInt(drag.oSelf!.css('left')) - t);
        if (!left && this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
        grid.check();
        this.scroll();
    }

    public resizeContainer(size = 10) {
        if (!this.dragContainer || !drag.oSelf) return;
        this.dragContainer.css({
            width: this.dragContainer.width()! + size,
            left: parseInt(this.dragContainer.css('left')) - size
        });
        drag.oSelf.css('left', parseInt(drag.oSelf.css('left')) + size);
        grid.check();
        this.initScroll();
    }
    public initScroll() {
        this.scrollBar!.width(this.scrollBarWidth = Math.pow(this.scrollWidth, 2) / this.dragContainer!.width()!);
        this.scroll();
    }
    public scroll() {
        const hidden = this.dragContainer!.width()! - this.scrollWidth,
            rate = (hidden - Math.abs(parseInt(this.dragContainer!.css('left')))) / hidden;
        this.scrollBar!.css('right', (this.scrollWidth - this.scrollBarWidth) * rate);
    }
    public showMask() {
        this.Magnets.forEach(x => x.trigger('showMask'));
    }
    public hideMask() {
        this.tcDel!.fadeOut();
        this.tcEdit!.fadeOut();
        this.Magnets.forEach(x => x.trigger('hideMask'));
    }
}

export default new MagnetManager();
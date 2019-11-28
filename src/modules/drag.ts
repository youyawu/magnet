import $ from 'jquery';
import grid from './grid';
import model from './index';
class Drag {
    public oSelf: JQuery<HTMLElement> | null = null
    private targetPosition: { left: number, top: number } | null = null
    private mouseClientX = 0
    private mouseCurrentX = 0
    private targetOffsetX = 0
    private targetOffsetY = 0
    public targetRowSpan = 0
    public targetColSpan = 0
    public model: JQuery<HTMLElement> | null = null
    public container: JQuery<HTMLElement> | null = null
    private _move: ((e: JQuery.MouseMoveEvent) => Boolean) | null = null
    public init(container: JQuery<HTMLElement>) {
        this.model = $('.model', this.container = container);
    }
    public move(e: JQuery.MouseMoveEvent) {
        this._move && this._move(e);
    }
    public targetDown({ clientX, clientY, currentTarget }: JQuery.MouseDownEvent) {
        this.oSelf = $(currentTarget);
        const { rowSpan, colSpan } = this.oSelf.trigger('clear').data('magnet');
        this.model!.css({
            width: colSpan * grid.size - grid.Margin,
            height: rowSpan * grid.size - grid.Margin,
            ...this.oSelf.position()
        }).show();
        this.targetRowSpan = rowSpan;
        this.targetColSpan = colSpan;
        this.targetPosition = this.oSelf.position();
        this.mouseClientX = this.mouseCurrentX = clientX;
        const { left, top } = this.oSelf.offset()!;
        this.targetOffsetX = clientX - left;
        this.targetOffsetY = clientY - top;
        this._move = this.targetMove;
        return false;
    }
    private targetMove({ clientY, clientX, screenX }: JQuery.MouseMoveEvent) {
        if (!this.oSelf || !this.container) return false;
        const offset = this.container.offset()!,
            maxLeft = this.container.width()! - this.oSelf.width()!,
            maxTop = this.container.height()! - this.oSelf.height()!,
            offsetX = clientX - this.mouseCurrentX,
            left = Math.min(Math.max(clientX - offset.left - this.targetOffsetX, 0), maxLeft),
            top = Math.min(Math.max(clientY - offset.top - this.targetOffsetY, 0), maxTop);
        this.oSelf.css({ left, top });
        if (screenX + 10 > window.screen.width) {
            model.timer = model.timer || window.setInterval(() => {
                if (left === maxLeft) { return model.resizeContainer() }
                return model.moveContainerLeft();
            }, 10);
        } else if (screenX < 10) {
            model.timer = model.timer || window.setInterval(model.moveContainerRight.bind(model), 15);
        } else {
            if (model.timer) {
                clearInterval(model.timer);
                model.timer = 0;
            }
            if (offsetX > 0 && left === maxLeft) {
                model.resizeContainer(offsetX);
            }
        }
        grid.check();
        this.mouseCurrentX = clientX;
        return false;
    }
    public containerDown({ clientX, currentTarget }: JQuery.MouseDownEvent) {
        this.oSelf = $(currentTarget).addClass('move');
        this.mouseClientX = this.mouseCurrentX = clientX;
        this._move = this.containerMove;
    }
    private containerMove({ clientX }: JQuery.MouseMoveEvent) {
        if (!this.oSelf) return false;
        let offsetx = clientX - this.mouseCurrentX,
            t = Math.min(Math.max(parseInt(this.oSelf.css('left')) + offsetx, model.dragWrapperWidth - this.oSelf.width()!), 0);

        this.oSelf!.css('left', t);
        model.scroll();
        this.mouseCurrentX = clientX;
        return false;
    }
    public clear({ clientX, target }: JQuery.MouseUpEvent) {
        if (!this.oSelf || !this.model) return false;
        if (model.timer) {
            clearInterval(model.timer);
            model.timer = 0;
        }
        const flag = clientX === this.mouseClientX;
        if (!this.oSelf.hasClass('move')) {
            this.oSelf.hasClass('err') && this.model.css(this.targetPosition!);
            this.oSelf.trigger('setPosition', this.model.position());
            this.oSelf.hasClass('addMagnet') ? this.oSelf.trigger('create') : this.oSelf.animate(this.model.position(), function () {
                flag || $(this).trigger('save');
            });
            this.model.hide();
        } else if (flag && target === this.oSelf.get(0)) {
            model.hideMask();
        }
        this.oSelf.removeClass('err move');
        this.mouseClientX = 0;
        this.oSelf = this._move = null;
    }
}

export default new Drag();
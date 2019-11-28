import drag from './drag';
import model, { Magnet } from './index';
class Grid {
    private rows = 12
    private cols: number = 0
    public size: number = 0
    public Margin = 5
    private grid: number[][] = []
    public init(width: number, height: number, maxCol: number) {
        this.size = height / this.rows | 0;
        this.cols = Math.max(width / this.size | 0, maxCol);
        drag.container!.width(this.cols * this.size);
        this.grid = [...Array(this.rows)].map(() => [...Array(this.cols)].fill(0));
    }
    public resize(height: number) {
        this.size = height / this.rows | 0;
        const width = this.cols * this.size;
        drag.container!.animate({
            width,
            left: Math.min(Math.max(parseInt(drag.container!.css('left')), model.dragWrapperWidth - width), 0)
        }, () => model.initScroll()
        );
    }
    public check() {
        if (!drag.oSelf || !drag.model) return;
        const col = parseInt(drag.oSelf.css('left')) / this.size | 0,
            row = parseInt(drag.oSelf.css('top')) / this.size | 0;
        this.addCols(col - this.cols);
        drag.oSelf[this._check(row, col, drag.targetRowSpan, drag.targetColSpan) ? 'removeClass' : 'addClass']('err');
        drag.model.css({ top: row * this.size, left: col * this.size });
    }
    private _check(row: number, col: number, rowSpan: number, colSpan: number) {
        if (row + rowSpan > this.rows) return false;
        return !this.grid.filter((r, i) => i >= row && i < row + rowSpan).map(x => x.slice(col, col + colSpan)).flat(1).some(x => x);
    }
    public addCols(cols: number) {
        if (cols <= 0) return;
        this.grid.forEach(c => c.splice(c.length, 0, ...Array(cols).fill(0)));
        this.cols += cols;
        const xw = Math.max(this.cols * this.size - drag.container!.width()!, 0);
        if (!xw) return;
        drag.container!.css({
            width: drag.container!.width()! + xw,
            left: parseInt(drag.container!.css('left')) - xw
        });
        console.log(drag.container!.css('width'), drag.container!.width(), this.cols * this.size);
    }
    public set({ row, col, rowSpan, colSpan }: Magnet, value: number) {
        if (!rowSpan || !colSpan) return false;
        this.addCols(col + colSpan - this.cols);
        return this.grid.filter((r, i) => i >= row && i < row + rowSpan).forEach(x => x.splice(col, colSpan, ...Array(colSpan).fill(value)));
    }
    public getMax(magnet: Magnet) {
        this.set(magnet, 0);
        let { row, col, rowSpan, colSpan } = magnet,
            xr = 4 - magnet.rowSpan,
            xc = 4 - magnet.colSpan;
        while (xr) {
            if (this._check(row, col, rowSpan + xr, colSpan)) break;
            xr--;
        }
        while (xc) {
            if (this._check(row, col, rowSpan, colSpan + xc)) break;
            xc--;
        }
        this.set(magnet, 1);

        return {
            maxRows: rowSpan + xr,
            maxCols: colSpan + xc
        };

    }
}
export default new Grid();

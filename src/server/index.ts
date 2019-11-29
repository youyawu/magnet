import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyparser from 'body-parser';
// import compression from 'compression'
// import morgan from 'morgan'
// import fs from 'fs'

// import bodyparser from 'body-parser'
// import request from 'request'
const app = express();
app.use(express.static(path.resolve(__dirname, './views')));
// app.use(compression())
// app.use(morgan("short", { stream: fs.createWriteStream('./a.log', { flags: 'a' }) }))
app.use(cors());

app.use(bodyparser.json(), bodyparser.urlencoded({ extended: false }));

const magnets = Array(3).fill(0).map((x, i) => ({
        id: i, // 标示
        icon: 'icon-glass', // 图标
        title: 'test' + i, // 名称
        url: 'http://127.0.0.1:3000/',
        type: i % 3 + 1, // 1 全屏 2半屏 3 新窗口
        refresh: i < 5, // 是否刷新
    })),
    themeInfo = {
    };
app.post('/layout', (req, res) => res.json({ magnets, themeInfo }));
app.post('/magnets/update', (req, res) => {
    const data = req.body;
    const m = magnets.find(({ id }) => id === data.id);
    Object.assign(m, data);
    res.json({ status: true, m });
});
app.post('/themeInfo/update', (req, res) => {
    Object.assign(themeInfo, req.body);
    res.json({ status: true });
});



app.listen(3000, () => console.log('listening on port:3000'));
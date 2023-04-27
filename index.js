const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const utils = require('./utils/index');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(httpServer);

io.on('connection', socket => {
    io.emit('status', '<span style="color:red">socket连接成功!</span>');//发送连接状态
    socket.on('sendMailInfo', async data => {//监听前端发来的查询信息
        io.emit('mailContent', await utils.mailContent(data))//直接调用，得到结果发送回去
    })
})

app.use(cors());
app.set('json spaces', 2)//格式化美观json
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))//处理post
app.use(express.static('./public'))


//获取邮箱地址
app.post('/post/mailInfo', async (req, res) => {
    const result = await utils.mailInfo()
    res.json(result)
})

//获取邮件内容
app.post('/post/mailContent', async (req, res) => {
    const result = await utils.mailContent(req.body);
    res.json(result)
})


httpServer.listen(30001, () => {
    console.log("The mail service is running on port 30001")
})
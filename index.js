const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const utils = require('./utils/index');

const app = express();
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


app.listen(30000, () => {
    console.log("The mail service is running on port 30000")
})
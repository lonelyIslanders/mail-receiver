const request = require('request');
const Imap = require('imap');
const MailParser = require('mailparser').MailParser;


module.exports = {
    //获取邮箱地址
    async mailInfo() {
        return new Promise((resolve, reject) => {
            // for test,anyone can use it
            // resolve({ status: 200, message: 'OK', data: { email: 'fortestpeng@outlook.com', password: 'f45yf43x032' } })
            // return;
            const options = {
                //替换成你的url
                url: 'https://xxxxxxxxxx',
                rejectUnauthorized: false
            }
            request(options, (err, res, body) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    const data = body.split('----');
                    const email = data[0]
                    const password = data[1].replace('<br>', '')
                    resolve({ status: 200, message: 'OK', data: { email: email, password: password } })
                }
            })
        })
    },

    //获取邮件内容
    async mailContent(body) {
        return new Promise((res, rej) => {
            const imap = new Imap({
                autotls: 'always',
                user: body.email,
                password: body.password,
                host: "outlook.office365.com",
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
            });

            function openInbox(typeMail, cb) {//暂不写搜寻垃圾邮件
                imap.openBox(typeMail, false, cb)//非只读模式
                //Junk or INBOX
            }

            imap.once('ready', () => {
                openInbox(body.boxType, (err, box) => {
                    if (err) {
                        console.log(err);
                    }
                    imap.search(['UNSEEN', ['SINCE', body.fromDate]], (err, results) => {
                        if (err) {
                            console.log(err);
                        }
                        if (results.length == 0) {
                            console.log('No matching emails');
                            res({ status: 401, message: 'No matching emails', data: {} });
                            return;
                        }
                        const result = imap.fetch(results, { bodies: '' })
                        result.on('message', (msg, seqno) => {
                            const mailParser = new MailParser()
                            msg.on('body', (stream, info) => {
                                stream.pipe(mailParser);

                                mailParser.on('headers', (headers) => {
                                    console.log('邮件主题：', headers.get('subject'));
                                })

                                mailParser.on('data', (data) => {
                                    if (mailParser.headers.get('subject').toLowerCase() === body.subject || ((mailParser.headers.get('subject')).toLowerCase()).includes(body.subject) && data.type === 'text') {
                                        console.log(data, seqno);
                                        if (body.markRead) {
                                            imap.seq.addFlags(seqno, 'Seen', (err) => {
                                                if (err) {
                                                    console.log(err)
                                                }
                                            })
                                        }
                                        res({ status: 200, message: 'OK', data: { subject: mailParser.headers.get('subject'), html: data.html, text: data.text, textAsHtml: data.textAsHtml } });
                                        imap.end()
                                    }
                                });
                            })
                        })
                        result.on('end', () => {
                            console.log("Nothing fetch")
                            res({ status: 401, message: "Nothing fetch", data: {} })
                        })
                    })
                })
            })

            imap.once('error', (err) => {
                if (err) {
                    console.log(err)
                }
                res({ status: 401, message: 'Invalid address or password or unsupported email', data: {} })
            });

            imap.once('end', () => {
                console.log('关闭邮箱');
            });

            imap.connect();
        })
    }
}
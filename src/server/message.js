const express = require('express');
const axios = require('axios');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const cors = require('cors');
app.use(cors());

const CHANNEL_ACCESS_TOKEN = 'HAlVBa4h2Kfjx3uPn3z11TX5AIncydNHGWF62BmzzSwDSpxQXB0Qng4BLhy6d87dFzdhdaT1umBQzesQ9w+lAO+OwfnCn8h/wZGemMlYLIRtmkc3PMFIoK476fDDyNVDD0yUYPgoap8G3tMkuCdAXwdB04t89/1O/w1cDnyilFU=';

app.post('/send-location', (req, res) => {
  const reg = req.body.reg;
  const product = req.body.product;
  const volume = req.body.volume;
  const name = req.body.name;
  const employee = req.body.employee;
  const depot = req.body.depot;

  res.json({ success: true });

  const message = {
    messages: [
      {
        "type": "text",
        "text": "-------ส่งงานลำดับที่ "+no+" ------"+
                "\nสินค้า: "+product+
                "\nปริมาตร: "+volume+"ลิตร"+
                "\n----------จัดส่งโดย-----------"+
                "\nพนักงานขับรถ: "+reg.split(":")[1]+
                "\nรถทะเบียน: "+reg.split(":")[0]+
                "\n--------สร้างเที่ยววิ่งโดย--------"+
                "\nพนักงาน: "+employee
      },
      {
        "type": "location",
        "title": "ตำแหน่งของลูกค้า",
        "address": name.split(':')[0],
        "latitude": name.split(':')[1],
        "longitude": name.split(':')[2]
      },
    ]
  }

  axios.post('https://api.line.me/v2/bot/message/broadcast', message, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
    }
  })
  .then(response => {
    res.json({ success: true });
  })
  .catch(error => {
    console.error('Error sending broadcast message:', error.response ? error.response.data : error.message);
    res.status(500).json({ success: false });
  });
});

app.listen(5000, () => {});

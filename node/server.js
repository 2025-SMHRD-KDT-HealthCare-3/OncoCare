const express = require('express');
const app = express();

app.get('/', (req, res) => {
    console.log('확인');
    res.send('확인용');
});

app.listen(3000);
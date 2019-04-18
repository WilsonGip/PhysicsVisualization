const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname)));
app.use("/demo", express.static(__dirname + '/demo'));
app.use("/libraries", express.static(__dirname + '/libraries'));
app.use("/styles", express.static(__dirname + '/styles'));
app.use("/images", express.static(__dirname + '/images'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('*', (req, res) => {
	res.status(404).send('NO PAGE FOUND');
});

app.listen(3000, () => console.log('Server running on port 3000'));

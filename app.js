const express = require('express');
const expressHbs = require('express-handlebars');
const bodyParser = require('body-parser');

const app = express();
const path = require('path');
const urlencodedParser = bodyParser.urlencoded({ extended: false });



const homeRoutes = require('./routes/home')
const mainRoutes = require('./routes/main')
const contactsRoutes = require('./routes/contacts')
const testRoutes = require('./routes/test')

// const keys = require('./config/keys')

const hostname = '127.0.0.1';
const port = 80;

const hbs = expressHbs.create({
  layoutsDir: path.join(__dirname + "/views/layouts"),
  defaultLayout: "layout",
  extname: "hbs",
  partialsDir: path.join(__dirname + "/views/partials"),
  helpers: require('./utils/hbs-helpers')
});
app.engine("hbs", hbs.engine);
app.set('view engine', 'hbs');

app.use('/static', express.static(__dirname + '/public'));
app.use('/src', express.static(__dirname + '/src'));
// hbs.registerPartials(__dirname + "/views/partials");

app.use('/', mainRoutes);
app.use('/main', mainRoutes);
app.use('/contacts', contactsRoutes);
app.use('/test', testRoutes);




app.listen(port, () => {
  console.log(`Сервер начал прослушивать по адресу http://localhost:${port}/main`)
})

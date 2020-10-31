var createError = require('http-errors');
var express = require('express');
var cors = require('cors');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

const STRIPE_SECRET_KEY =
  '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';

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

require('dotenv').config({ path: './.env' });
const stripe = require('stripe')(STRIPE_SECRET_KEY);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

/**
 * Create checkout session for Bluey products
 */
app.post('/create-checkout-session', async (req, res) => {
  let { lineItems } = req.body;

  // TODO: add to environment for scaling
  // TODO: ADD ALL OTHERS!
  const dynamicTaxRateList = ['txr_1HhnE3IZSSMTzx9qdJe7a46Z'];

  const lineItemsForCheckout = lineItems.map((item) => {
    return {
      price: item.price,
      quantity: item.quantity,
      dynamic_tax_rates: dynamicTaxRateList,
    };
  });

  let itemDict = {};
  lineItemsForCheckout.forEach((item, index) => {
    itemDict[index] = item.price;
  });

  const itemParams = (queryString = Object.keys(itemDict)
    .map((key) => 'itemPurchased' + '=' + itemDict[key])
    .join('&'));

  let session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItemsForCheckout,
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    allow_promotion_codes: true,

    // TODO: Fix success and cancel URLs.
    // success_url: `http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}&${itemParams}`,
    // cancel_url: `http://localhost:4200/cancelled?session_id={CHECKOUT_SESSION_ID}`,
    success_url: `https://blueyshop.com/success?session_id={CHECKOUT_SESSION_ID}&${itemParams}`,
    cancel_url: `https://blueyshop.com/cancelled?session_id={CHECKOUT_SESSION_ID}`,
    // success_url: 'test',
    // cancel_url: 'test',
  });

  // session.success_url = `https://blueyshop.com/success?session_id=${session.id}`;
  // session.cancel_url = `https://blueyshop.com/canceled?session_id=${session.id}`;

  // pm2 start /opt/bitnami/projects/bluey-api/bin/www

  res.send({
    sessionId: session.id,
  });
});

/**
 * Get session id
 */
app.get('/checkout-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );
    res.status(200);
    res.send(session);
  } catch (e) {
    res.status(400).send({
      message: 'Invalid session id!',
    });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

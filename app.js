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
  const dynamicTaxRateList = [
    'txr_1HiNcWIZSSMTzx9q8V3hW045',
    'txr_1HiNcHIZSSMTzx9qP9MbgVeP',
    'txr_1HiNc9IZSSMTzx9q129uktqM',
    'txr_1HiNc0IZSSMTzx9qMlkF7P7i',
    'txr_1HiNbkIZSSMTzx9q03GjJceC',
    'txr_1HiNbaIZSSMTzx9qSqUKOJKL',
    'txr_1HiNbRIZSSMTzx9qSMl6U5vD',
    'txr_1HiNbGIZSSMTzx9qhP3XvZ3J',
    'txr_1HiNb7IZSSMTzx9qR47QXfRa',
    'txr_1HiNazIZSSMTzx9qUIS2k1OG',
    'txr_1HiNamIZSSMTzx9qE1W5navP',
    'txr_1HiNaeIZSSMTzx9qvvBe2DaG',
    'txr_1HiNaUIZSSMTzx9q46TUCtY8',
    'txr_1HiNaLIZSSMTzx9qTL7dg5sB',
    'txr_1HiNaCIZSSMTzx9qlSqhe3mc',
    'txr_1HiNa1IZSSMTzx9qgc0GXN6h',
    'txr_1HiNZuIZSSMTzx9qIXrzU4Dn',
    'txr_1HiNZlIZSSMTzx9qTEVLOGG0',
    'txr_1HiNZXIZSSMTzx9qHWWg2H43',
    'txr_1HiNZPIZSSMTzx9qjnOJpiyd',
    'txr_1HiNZFIZSSMTzx9qWxfepFCL',
    'txr_1HiNZ3IZSSMTzx9qwBJFJRuq',
    'txr_1HiNYvIZSSMTzx9qlFLSCj5F',
    'txr_1HiNYjIZSSMTzx9qwlPKGTsy',
    'txr_1HiNYYIZSSMTzx9qexfSTU0x',
    'txr_1HiNYMIZSSMTzx9qhuvS0R6c',
    'txr_1HiNYDIZSSMTzx9qHYbKnA73',
    'txr_1HiNY3IZSSMTzx9q1jTQFbZT',
    'txr_1HiNXtIZSSMTzx9qJe79HQLq',
    'txr_1HiNXjIZSSMTzx9qeJMLBGGD',
    'txr_1HiNVmIZSSMTzx9qq5rqT6Wd',
    'txr_1HiNVbIZSSMTzx9qsHc0Izjn',
    'txr_1HiNVOIZSSMTzx9qu0LuzRqX',
    'txr_1HiNVBIZSSMTzx9qwqv7WgQ9',
    'txr_1HiNV1IZSSMTzx9qeB5IXwy8',
    'txr_1HiNUrIZSSMTzx9qofGKaUFP',
    'txr_1HiNUhIZSSMTzx9qn2TtQi2c',
    'txr_1HiNUZIZSSMTzx9qh6EQqvqS',
    'txr_1HiNUQIZSSMTzx9qQhP51Uzc',
    'txr_1HiNUDIZSSMTzx9q7QIBJcLe',
    'txr_1HiNU1IZSSMTzx9qhO11kyss',
    'txr_1HiNTpIZSSMTzx9qfVu5ct7J',
    'txr_1HiNTcIZSSMTzx9qV2imN89v',
    'txr_1HiNTTIZSSMTzx9qV0tcfAqJ',
    'txr_1HiNTJIZSSMTzx9ql2giCHiq',
    'txr_1HiNT6IZSSMTzx9qTegcBmuB',
    'txr_1HiNSvIZSSMTzx9qK43KAmsW',
    'txr_1HiNSiIZSSMTzx9qHCThWo7S',
    'txr_1HiNSWIZSSMTzx9q7VxLy1hg',
    'txr_1HiNSDIZSSMTzx9q93wT3F8u',
    'txr_1HhnE3IZSSMTzx9qdJe7a46Z',
  ];

  const lineItemsForCheckout = lineItems.map((item) => {
    return {
      price: item.price,
      quantity: item.quantity,
      dynamic_tax_rates: dynamicTaxRateList,
    };
  });

  // TODO: check for custom deck order
  //  - create product with name custom: name
  //  - create product with descprtion - colors!!
  // https://stripe.com/docs/billing/prices-guide
  // use the above for product and price

  // const product = await stripe.products.create({
  //   name: 'Gold Special',
  // });

  // TODO: use custom order data here
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

    // TODO: ADD VARS TO ENV FILE!!!!!
    success_url: `https://blueyshop.com/success?session_id={CHECKOUT_SESSION_ID}&${itemParams}`,
    cancel_url: `https://blueyshop.com/cancelled?session_id={CHECKOUT_SESSION_ID}`,
  });

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

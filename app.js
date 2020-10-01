var createError = require('http-errors');
var express = require('express');
var cors = require('cors');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

require('dotenv').config({ path: './.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
  const domainURL = process.env.DOMAIN;

  let { lineItems } = req.body;

  // TODO: add to environment for scaling
  const dynamicTaxRateList = [
    'txr_1HWpTwIZSSMTzx9qIkaJE4LF',
    'txr_1HWuIbIZSSMTzx9qZssUf39R',
    'txr_1HWuJ7IZSSMTzx9qiwVN6D9B',
  ];

  const lineItemsForCheckout = lineItems.map((item) => {
    return {
      price: item.price,
      quantity: item.quantity,
      dynamic_tax_rates: dynamicTaxRateList,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: process.env.PAYMENT_METHODS.split(', '),
    mode: 'payment',
    line_items: lineItemsForCheckout,
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['US'],
    },

    // TODO: Fix success and cancel URLs.
    success_url: `http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:4200/cancelled?session_id={CHECKOUT_SESSION_ID}`,
    // success_url: `${domainURL}/success?session_id=${CHECKOUT_SESSION_ID}`,
    // cancel_url: `${domainURL}/canceled?session_id=${CHECKOUT_SESSION_ID}`,
  });

  res.send({
    sessionId: session.id,
  });
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

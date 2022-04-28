/**
   * @fileoverview This file supports a sample product from your store that suggests a
   * new product on every load and uses Google Pay as a means of payment.
   */


/**
 * Google Pay API Configuration
 */
const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
        gateway: 'dlocal',
        gatewayMerchantId: 'YOUR_GATEWAY_MERCHANT_ID'
    }
}

const cardPaymentMethod = {
    type: 'CARD',
    tokenizationSpecification: tokenizationSpecification,
    parameters: {
        allowedCardNetworks: ['VISA', 'MASTERCARD'],
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
    }
};

const googlePayConfiguration = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [cardPaymentMethod],
};
/**
 * Holds the Google Pay client used to call the different methods available
 * through the API.
 * @type {PaymentsClient}
 * @private
 */
let googlePayClient;

/**
 * Defines and handles the main operations related to the integration of
 * Google Pay. This function is executed when the Google Pay library script
 * has finished loading.
 */
function onGooglePayLoaded() {
    googlePayClient = new google.payments.api.PaymentsClient({
        environment: 'TEST',
    });

    googlePayClient.isReadyToPay(googlePayConfiguration)
        .then(response => {
            if (response.result) {
                createAndAddButton();
            } else {
                // The current user cannot pay using Google Pay.
                // Offer another payment method.
            }
        })
        .catch(error => console.error('isReadyToPay error: ', error))
}

/**
 * Handles the creation of the button to pay with Google Pay.
 * Once created, this button is appended to the DOM, under the element 'buy-now'.
 */
function createAndAddButton() {
    const googlePayButton = googlePayClient.createButton({
        buttonColor: 'white',
        buttonType: 'buy',
        onClick: onGooglePayButtonClicked,
    });

    document.getElementById('buy-now').appendChild(googlePayButton);
}

/**
 * Handles the click of the button to pay with Google Pay.
 * Takes care of defining the payment data request to be used in order to load
 * the payment methods available to the user.
 */
function onGooglePayButtonClicked() {
    const paymentDataRequest = {
        ...googlePayConfiguration
    };
    paymentDataRequest.merchantInfo = {
        merchantId: 'BCR2DN6T7P04XAJG',
        merchantName: 'Your Shop Name',
    };

    paymentDataRequest.transactionInfo = {
        totalPriceStatus: 'FINAL',
        totalPrice: '1.00',
        currencyCode: 'EUR',
        countryCode: 'ES',
    };

    googlePayClient.loadPaymentData(paymentDataRequest)
        .then(paymentData => processPaymentData(paymentData))
        .catch(error => console.error('loadPaymentData error: ', error))
}

function processPaymentData(paymentData) {
    fetch(ordersEndPointUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: paymentData
    })
}

/**
 * Send payment to dload gateway
 */
function dlocalRequestPayment() {
    fetch('https://api.dlocal.com/secure_payments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            "amount": 1.00,
            "currency": "BRL",
            "country": "BR",
            "payment_method_id": "CARD",
            "payment_method_flow": "DIRECT",
            "payer": {
                "document": "53033315550",
                "name": "Ricardo Gomes"
            },
            "card": {
                "gpay_token": {
                    "signature": "MEQCIBllBeoYFjIvIjPZmYG..." // Add google pay token
                }
            },
            "order_id": "657434343",
            "notification_url": "http://merchant.com/notifications"
        }
    })
}
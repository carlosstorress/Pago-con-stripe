  
  var firebaseConfig = {

        apiKey: "AIzaSyBBRcz1ribgZLcW_NvD5bydu57GYbflbVw",
        authDomain: "pagos-be3ac.firebaseapp.com",
        projectId: "pagos-be3ac",
        storageBucket: "pagos-be3ac.appspot.com",
        messagingSenderId: "716334297943",
        appId: "1:716334297943:web:37864607c4b67c7c21c412",
        measurementId: "G-G22KLY5K1J"

  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const checkoutButton = document.getElementById('checkout-button')
  const createStripeCheckout = firebase.functions().httpsCallable('createStripeCheckout')
  const stripe = Stripe('pk_test_51MgqzbFsLXR5H817ERftCB8k0o5EQwZ2O1kZIVGMowZ8IHwynOLZBu36kl6uD0DBglSypRzQYecgSqWfvs0TuTRh000YGNf2Id')
  
  checkoutButton.addEventListener('click', () => {
    createStripeCheckout()
      .then(response => {
        const sessionId = response.data.id
        stripe.redirectToCheckout({ sessionId: sessionId })
      })
  })
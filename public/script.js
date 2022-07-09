
    

        // add css file
        var link = document.createElement( "link" );
        link.href = "https://d2pqf5y4utldd5.cloudfront.net/style.css"
        link.type = "text/css";
        link.rel = "stylesheet";
        link.media = "screen,print";
        document.getElementsByTagName( "head" )[0].appendChild( link );




    if(window.location.pathname.search(/products/) != -1){
        console.log("script started");
        var data = fetch("/apps/buynow")  .then(function(response) {
          return response.text();
        }).then(function(data) {
          document.getElementsByName("add")[0].outerHTML += data;
          
          
              let APIurl =   `${window.location.pathname}.js`;
              var productDetails = {}; // stores variantId => Varaintprice
              var productAvailable = {}; // stores variantId => true/false
              var currPrice = 0;

              fetch(APIurl)           
                  .then(response => response.json())
                  .then(data => {
                          data.variants.forEach((item) => {
                              productDetails[item.id] = (item.price/100); // get Details of product varaint from the API
                          });
                          data.variants.forEach((item) => {
                            productAvailable[item.id] = item.available; // get Details of product varaint from the API
                          });
                          console.log( productDetails, productAvailable);
                          var productForm = formSerialize(document.querySelector('[action="/cart/add"]'));
                          var formValue = JSON.parse(productForm); // find the selected variantID on the store
                          currPrice = productDetails[formValue.id]; // find price of the selected variantID
                          document.getElementById("price").innerHTML = currPrice;
                          document.getElementById("price-btn-atag").href = createCheckoutUrl(formValue.id);
                          document.getElementById("price-btn").style.visibility = "visible";
                          document.getElementById("buyNowButtonAAowle").disabled = !productAvailable[formValue.id];


                          // add onchange event listner on form element, So that when user changes product variant then we should get new Price accordingly
                          document.querySelector('[action="/cart/add"]').addEventListener('change', () => { 
                            document.getElementById("price-btn").style.visibility = "hidden";
                              var productForm = formSerialize(document.querySelector('[action="/cart/add"]'));
                              var formValue = JSON.parse(productForm, "current Price");
                              currPrice = productDetails[formValue.id];
                              document.getElementById("price").innerHTML = currPrice;
                              document.getElementById("price-btn-atag").href = createCheckoutUrl(formValue.id);
                              document.getElementById("price-btn").style.visibility = "visible";
                              document.getElementById("buyNowButtonAAowle").disabled = !productAvailable[formValue.id];
                          });
                          

                  }).catch((e) => {
                      console.log(e);
                      document.getElementById("price").innerHTML = "{Price}";
                      document.getElementById("price-btn").style.visibility = "visible";
                  })


              /**
               * create checkout URl from the VariantID
               * @param {id of the selected variant} variantId 
               * @returns 
               */
              function createCheckoutUrl(variantId) {
                  return `/checkout/${variantId}:1`;
              }


              /**
               * serialize form element into data
               * @param {HTMLDomElement} myDocument 
               * @returns 
               */
              function formSerialize(myDocument){
                  var obj = {};
                  var elements = myDocument.querySelectorAll( "input, select, textarea" );
                  for( var i = 0; i < elements.length; ++i ) {
                      var element = elements[i];
                      var name = element.name;
                      var value = element.value;

                      if( name ) {
                          obj[ name ] = value;
                      }
                  }
                  return JSON.stringify( obj );
              }

          
        });
      }



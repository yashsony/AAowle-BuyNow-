 
var redirectLink = "";


window.addEventListener('DOMContentLoaded', (event) => {
  
    const div1 = document.createElement('div');
    div1.innerHTML = `<div id="StickyAAwoleLayout" style="visibility: hidden"> 
        <div style="border: 0px solid black;" id="StickyAAwoleAddtoCart"> 
          <div id="StickyAAolweVariantName" ></div>
  
          <div id="StickyAAolweVariantOptions"> <b> </b></div>
        </div>
          <div style="border: 0px solid black;"id="StickyAAowleBuyNow"> </div>
      </div>`;

  
    
        document.body.appendChild(div1);
        var loaderCode =`<div class="" id="loader-backgroud" ><div class="" id="loader"></div></div>`;
        document.body.innerHTML += loaderCode;
 
  
    

    if(window.location.pathname.search(/products/) != -1){

        var left = document.getElementById("StickyAAwoleLayout");
        left.style.position = 'fixed';
        left.style.bottom = '0px';
        var lastScrollTop = 0;
        
        document.addEventListener("scroll", function() { // if user scroll down and height is more than 700 then show sticky 
          var st = window.pageYOffset || document.documentElement.scrollTop;
          if (st > lastScrollTop && st > 700){
            left.style.display = 'flex';
          } else {
            left.style.display = 'none';
          }
          lastScrollTop = st <= 0 ? 0 : st;
        }, false);
        
        
        
      
  
        // add css file
        var link = document.createElement( "link" );
        link.href = "https://d2pqf5y4utldd5.cloudfront.net/style.css"
        link.type = "text/css";
        link.rel = "stylesheet";
        link.media = "screen,print";
        document.getElementsByTagName( "head" )[0].appendChild( link );
  
  
  
  
      if(window.location.pathname.search(/products/) != -1){
        
            Promise.all([
              fetch("/apps/buynow/stickybuynow").then(function(response) {
                    return response.text();
              }),
              fetch("/apps/buynow/buynow").then(function(response) {
                return response.text();
              })
            ]).then((values) => {
              	document.getElementById("StickyAAowleBuyNow").innerHTML += values[0];
				document.getElementsByName("add")[0].outerHTML += values[1];
              
                var APIurl =   `${window.location.pathname}.js`;
                var productDetails = {}; // stores variantId => Varaintprice
                var productAvailable = {}; // stores variantId => true/false
                var productName = {}; // store variantId = > 'ADIDAS | CLASSIC BACKPACK - OS / black / Ruber'
                var productOption = {}; // store variantId = > 'OS / black / Ruber'
                var currPrice = 0;
            


                function setHiddenOrVisible(status){
                  if(screen && screen.width < 480) { //check is it mobile means sticky
                    document.getElementById('StickyAAwoleLayout').style.visibility = status;
                    document.getElementById('StickyAAowleBuyNow').style.visibility = status;
                  }
                  document.getElementById('buyNowButtonAAowle').style.visibility = status;
                }
  
                fetch(APIurl)         
                    .then(response => response.json())
                    .then(data => {
                            data.variants.forEach((item) => {
                                productDetails[item.id] = (item.price/100); // get Details of product varaint from the API
                            });
                            data.variants.forEach((item) => {
                              productAvailable[item.id] = item.available; // get Details of product varaint from the API
                            });
                  
                            data.variants.forEach((item) => {
                              productName[item.id] = item.name; // get Details of product name from the API
                            });
                  
                            data.variants.forEach((item) => { // get Details of product variant options from the API
                              productOption[item.id] = " " ; // get Details of product varaint from the API
                              if(item.option1){
                                productOption[item.id] += item.option1 ;
                              }
                              if(item.option2){
                                productOption[item.id] +=  " | " + item.option2;
                              }
                              if(item.option3){
                                productOption[item.id] += " | " + item.option3 ;
                              }
                            });
                  
                            console.log( productDetails, productAvailable, productName, productOption);
                            var productForm = formSerialize(document.querySelector('[action="/cart/add"]'));
                            var formValue = JSON.parse(productForm); // find the selected variantID on the store
                            currPrice = productDetails[formValue.id];// find price of the selected variantID
                               
                            setHiddenOrVisible("hidden");
                  
                            if(productAvailable[formValue.id]){
  
                                var cols = document.getElementsByClassName("AAowlePrice");
                                 for(i=0; i<cols.length; i++) {
                                    cols[i].innerHTML = currPrice;
                                 }
  
                                 createCheckoutUrl(formValue.id);
  
                                document.getElementById('StickyAAolweVariantOptions').innerText = productOption[formValue.id];
                                document.getElementById('StickyAAolweVariantName').innerText = productName[formValue.id];
                          
                                setHiddenOrVisible("visible");
                            }
  
  
                              
                            // add onchange event listner on form element, So that when user changes product variant then we should get new Price accordingly
                            document.querySelector('[action="/cart/add"]').addEventListener('change', () => { 
  
                              setHiddenOrVisible("hidden");
                              var productForm = formSerialize(document.querySelector('[action="/cart/add"]'));
                              var formValue = JSON.parse(productForm, "current Price");
                  
                              if(productAvailable[formValue.id]){
                                currPrice = productDetails[formValue.id];
                                console.log(currPrice);
  
                                var cols = document.getElementsByClassName("AAowlePrice");
                                for(i=0; i<cols.length; i++) {
                                  cols[i].innerHTML = currPrice;
                                }
  

                                createCheckoutUrl(formValue.id);
                                
  								
                              document.getElementById('StickyAAolweVariantOptions').innerText = productOption[formValue.id];
                                document.getElementById('StickyAAolweVariantName').innerText = productName[formValue.id];
                                   setHiddenOrVisible("visible");
  
                              }
  
                          });
              
                      		var elements = document.getElementsByClassName("AAowleBuyNowbutton");
                            for (var i = 0; i < elements.length; i++) {
                              elements[i].addEventListener("click", ()=> {
                    				 startLoading();                                                             
              						window.location.href = redirectLink;
                                    
							  }, false);
                            }
    
  
  
                    }).catch((e) => {
                        		console.log(e);
 								var cols = document.getElementsByClassName("AAowlePrice");
                                for(i=0; i<cols.length; i++) {
                                  cols[i].innerHTML = `{Price}`;
                                }
  
                              document.getElementById('StickyAAolweVariantOptions').innerText = `{Variant Options}`;
                              document.getElementById('StickyAAolweVariantName').innerText = `{Variant Name}`;
                              setHiddenOrVisible("visible");
                    })
              
              
    
              	
			
                function startLoading(){
                  document.getElementById("loader-backgroud").classList.add("loader-backgroud");
                  document.getElementById("loader").classList.add("loader");
                }
            
            

  
  
                /**
                 * create checkout URl from the VariantID
                 * @param {id of the selected variant} variantId 
                 * @returns 
                 */
                function createCheckoutUrl(variantId) {
                    redirectLink = window.location.origin +   `/checkout/${variantId}:1`;
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
  
            
          }); //end promise all
        }
      
    }
    
  });
        
    

    
 

   

    
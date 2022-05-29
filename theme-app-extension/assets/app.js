
let APIurl =   `${window.location.pathname}.js`;
var productDetails = {};
var currPrice = 0;

fetch(APIurl)           
    .then(response => response.json())
    .then(data => {
            data.variants.forEach((item) => {
                productDetails[item.id] = (item.price/100);
            });
            console.log(data, productDetails);
            var productForm = formSerialize(document.querySelector('[action="/cart/add"]'));
            var formValue = JSON.parse(productForm);
            currPrice = productDetails[formValue.id];
            document.getElementById("price").innerHTML = currPrice;
            document.getElementById("price-btn").href = createCheckoutUrl(formValue.id);
            console.log(currPrice, "current Price");



            document.querySelector('[action="/cart/add"]').addEventListener('change', ()=>{
                var productForm = formSerialize(document.querySelector('[action="/cart/add"]'));
                var formValue = JSON.parse(productForm, "current Price");
                currPrice = productDetails[formValue.id];
                document.getElementById("price").innerHTML = currPrice;
                document.getElementById("price-btn").href = createCheckoutUrl(formValue.id);
                console.log(currPrice, "current Price");
            });
    });



function createCheckoutUrl(variantId) {
    return `/cart/${variantId}:1`;
}



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
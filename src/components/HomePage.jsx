import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  Button,
  SettingToggle,
  TextStyle,
  FormLayout,
  ColorPicker,
  DisplayText,
  ContextualSaveBar,
  Frame,
  hsbToRgb,
  Banner
  
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { userLoggedInFetch } from "../App";
import { useEffect, useState, useCallback,  useLayoutEffect } from "react";






export function HomePage() {

  const app = useAppBridge();
  const fetch = userLoggedInFetch(app);


  const [active, setActive] = useState(false);

  const [banner, setBanner] = useState(false);



  const contentStatus = active ? 'Deactivate' : 'Activate';
  const textStatus = active ? 'activated' : 'deactivated';


    // when state variable will change
    async function loadShopConfig() {
      var data = await fetch("/getIntialConfig");
  
      if (data.status == 200) {
        data = await data.text();
        if (data == "true") {
          setActive(() => true); // need to change this logic because it fetches again where state changes
        } else {
          setActive(() => false); 
        }
      }
      else{
        console.log(data);
      }
    }
  
    useLayoutEffect(() => {
      if(!banner) loadShopConfig();
    });


  async function enableIt() {
    setActive((active) => !active)
    await fetch("/enableIt?activate=" + !active)
    .then((res) => res.text())
    .then((g) => { 
      setBanner(() => true);
      setTimeout(() => {
        setBanner(() => false);
      }, 3000);
    })
    .catch((e) => alert("getting error, please try again after some time"));
  }



  const [Textcolor, setTextColor] = useState({
    hue: 200,
    brightness: 0.9,
    saturation:  0.016985138004246284
  });


  const [BGcolor, setBGColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 1
  });


function updateTextColor(color){
  console.log(color)
  setTextColor(color);
}

function updateBGColor(color){
  setBGColor(color);
}


async function onSubmit(){
    var TextcolorObj = hsbToRgb(Textcolor);
    var BGcolorObj = hsbToRgb(BGcolor);

      var text1 = "rgba(" + TextcolorObj.red + ", " + TextcolorObj.green  + ", " + TextcolorObj.blue  + ", " + TextcolorObj.alpha + ")";
      var text2 = "rgba(" + BGcolorObj.red + ", " + BGcolorObj.green  + ", " + BGcolorObj.blue  + ", " + BGcolorObj.alpha + ")";
      
      var obj = {
        "BGcolor" : text2,
        "textColor" : text1
      }
      console.log(obj);

      const authFetch = userLoggedInFetch(app);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj),
      };
      try {
        var response = await authFetch("/save", requestOptions);
        var data = await response.text();
        console.log(data);
        setBanner(() => true);
        setTimeout(() => {
          setBanner(() => false);
        }, 5000);
      } catch (error) {
         alert("getting error, please try again after some time");
      }


}


  return (
    <>

      {banner && ( <Banner title= {  "Successfully Saved Changes. It will take around a minute to reflect changes, please wait."}  status="success" />  )}

      <Page fullWidth>
        <Layout>




          <Layout.Section>



          


            <SettingToggle
              action={{
                content: contentStatus,
                onAction: enableIt,
              }}
              enabled={active} >
              AAowle BuyNow is <TextStyle variation="strong">{textStatus}</TextStyle>.
            </SettingToggle>

          </Layout.Section>
        </Layout>
      </Page>

      <Page>

        <Layout>


        <Layout.Section oneHalf >

        <Card title="Choose Bankground Color of Button" sectioned >

          <ColorPicker onChange={updateBGColor} color={BGcolor}  fullWidth />


        </Card>

        </Layout.Section>


          <Layout.Section oneHalf>
            <Card title="Choose Text Color of button" sectioned >

              <ColorPicker onChange={updateTextColor} color={Textcolor} fullWidth />


            </Card>

          </Layout.Section>



          

        </Layout>
        <Layout.Section>

        <Button primary onClick={onSubmit} >Save</Button>

</Layout.Section>

      </Page>

    </>

    
  );
}

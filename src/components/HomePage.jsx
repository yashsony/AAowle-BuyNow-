import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  Button
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { userLoggedInFetch } from "../App";




export function HomePage() {

  const app = useAppBridge();
  const fetch = userLoggedInFetch(app);
  async function enableIt() {
    console.log("called");
    fetch("/enableIt").then((res) => res.json()).then((g) => { console.log(g)})
  }


  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <Button 
          onClick = { () => { enableIt() }}
          > Enable
          </Button> 
          <Card sectioned>

                <TextContainer spacing="loose">
                  <Heading> Thankyou for installing the app 🎉</Heading>
                  <p>Please watch this 1 min video tutorial to add AAowle BuyNow button. </p>
                  <iframe  width="100%" height="515" src="https://www.youtube.com/embed/R12VeubhgRk" title="YouTube video player" frameborder="0" allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ></iframe>
                </TextContainer>

          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

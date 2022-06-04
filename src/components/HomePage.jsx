import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
} from "@shopify/polaris";

import trophyImgUrl from "../assets/home-trophy.png";

import { ProductsCard } from "./ProductsCard";

export function HomePage() {
  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <Card sectioned>

                <TextContainer spacing="loose">
                  <Heading> Thankyou for installing the app 🎉</Heading>
                  <p>Please watch this 1 min video tutorial to add AAowle BuyNow button. </p>
                  <iframe allow="fullscreen;" width="100%" height="515" src="https://www.youtube.com/embed/R12VeubhgRk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </TextContainer>

          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

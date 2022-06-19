// @ts-nocheck
import { resolve } from "path";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, ApiVersion } from "@shopify/shopify-api";
import "dotenv/config";

import { ScriptTag } from '@shopify/shopify-api/dist/rest-resources/2022-04/index.js'
import { Metafield } from '@shopify/shopify-api/dist/rest-resources/2022-04/index.js';

import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";

import getRawBody from "raw-body";
import crypto from "crypto";
const secretKey = process.env.SHOPIFY_API_SECRET;


const USE_ONLINE_TOKENS = true;
const TOP_LEVEL_OAUTH_COOKIE = "shopify_top_level_oauth";

const PORT = parseInt(process.env.PORT || "8081", 10);
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.April22,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};
Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/webhooks",
  webhookHandler: async (topic, shop, body) => {
    delete ACTIVE_SHOPIFY_SHOPS[shop];
  },
});

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  const app = express();
  app.set("top-level-oauth-cookie", TOP_LEVEL_OAUTH_COOKIE);
  app.set("active-shopify-shops", ACTIVE_SHOPIFY_SHOPS);
  app.set("use-online-tokens", USE_ONLINE_TOKENS);

  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app);

  app.post("/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
      if (!res.headersSent) {
        res.status(500).send(error.message);
      }
    }
  });

  app.get("/proxy", async (req, res) => {
    console.log("request for liquid");
    res.setHeader('Content-Type', 'application/liquid');
    res.status(200).sendFile(resolve('public/my.liquid'));
  });


  app.get("/enableIt", async (req, res) => {
    console.log("request for enabling", req.query.activate); 

    try {
    const test_session = await Shopify.Utils.loadCurrentSession(req, res);
    let scriptObj  = await ScriptTag.all({
      session: test_session,
    });
    console.log("here", scriptObj);

    function checkSrc(item) {
      return item.src == "https://d2pqf5y4utldd5.cloudfront.net/script.js" ;
    }
    let foundObj =   scriptObj.find(checkSrc);
    if(foundObj == undefined){
      if(req.query.activate == "true" ){
        console.log("attaching scriptTag to store");
        const script_tag = new ScriptTag({session: test_session});
        script_tag.event = "onload";
        script_tag.src = "https://d2pqf5y4utldd5.cloudfront.net/script.js";
        await script_tag.save({});
      }
      else{
        console.log("Already Script is not attched with store");
      }
    }
    else{
      if(req.query.activate == "true" ){
        console.log("Already Script is attched with store");
      }
      else{
        let a = await ScriptTag.delete({
          session: test_session,
          id: foundObj.id,
        });
        console.log("deleting script with store");
      }
    }
    res.status(200).send("success");
  
    } catch (error) {
      res.status(500).send("getting error, please try again after some time");
    }
  });




  app.post(
    ["/customers/data_request", "/customers/redact", "/shop/redact"],
    async (req, res) => {
      const hmac = req.get("X-Shopify-Hmac-Sha256");

      const body = await getRawBody(req);

      const hash = crypto
        .createHmac("sha256", secretKey)
        // @ts-ignore
        .update(body, "utf8", "hex")
        .digest("base64");

      if (hash === hmac) {
        console.log("Phew, it came from Shopify!");
        res.sendStatus(200);
      } else {
        console.log("Danger! Not from Shopify!");
        res.sendStatus(401);
      }
    }
  );

  app.post("/save", verifyRequest(app), async (req, res) => {
    try {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      req.on('end',async () => {
        let obj = await JSON.parse(data); 
        console.log(obj.BGcolor, obj.textColor); 

        const test_session = await Shopify.Utils.loadCurrentSession(req, res);

        const metafield1 = new Metafield({session: test_session});
        metafield1.namespace = "AAowleBuyNow";
        metafield1.key = "buttonColor";
        metafield1.value = obj.BGcolor;
        metafield1.type = "single_line_text_field";
        await metafield1.save({});
    
        const metafield2 = new Metafield({session: test_session});
        metafield2.namespace = "AAowleBuyNow";
        metafield2.key = "textColor";
        metafield2.value = obj.textColor;
        metafield2.type = "single_line_text_field";
        await metafield2.save({});

        const metafield4 = new Metafield({session: test_session});
        metafield4.namespace = "AAowleBuyNow";
        metafield4.key = "debugMode";
        metafield4.value = true;
        metafield4.type = "boolean";
        await metafield4.save({});

        
        res.status(200).send(data);
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });





  app.get("/products-count", verifyRequest(app), async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.post("/graphql", verifyRequest(app), async (req, res) => {
    try {
      const response = await Shopify.Utils.graphqlProxy(req, res);
      res.status(200).send(response.body);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.use(express.json());

  app.use((req, res, next) => {
    const shop = req.query.shop;
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${shop} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  app.use("/*", (req, res, next) => {
    const { shop } = req.query;

    // Detect whether we need to reinstall the app, any request from Shopify will
    // include a shop in the query parameters.
    if (app.get("active-shopify-shops")[shop] === undefined && shop) {
      res.redirect(`/auth?${new URLSearchParams(req.query).toString()}`);
    } else {
      next();
    }
  });

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (!isProd) {
    vite = await import("vite").then(({ createServer }) =>
      createServer({
        root,
        logLevel: isTest ? "error" : "info",
        server: {
          port: PORT,
          hmr: {
            protocol: "ws",
            host: "localhost",
            port: 64999,
            clientPort: 64999,
          },
          middlewareMode: "html",
        },
      })
    );
    app.use(vite.middlewares);
  } else {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    const fs = await import("fs");
    app.use(compression());
    app.use(serveStatic(resolve("dist/client")));
    app.use("/*", (req, res, next) => {
      // Client-side routing will pick up on the correct route to render, so we always render the index here
      res
        .status(200)
        .set("Content-Type", "text/html")
        .send(fs.readFileSync(`${process.cwd()}/dist/client/index.html`));
    });
  }

  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) => app.listen(PORT));
}

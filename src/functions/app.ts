import { Probot } from "probot"
import crypto from "crypto"
import { EmitterWebhookEvent } from "@octokit/webhooks"


// code_scanning_alert
let csaEventHubUri = process.env["csaEventHubUri"]
let csaSaName = process.env["csaSaName"]
let csaSaKey = process.env["csaSaKey"]

// secret_scanning_alert
let ssaEventHubUri = process.env["ssaEventHubUri"]
let ssaSaName = process.env["ssaSaName"]
let ssaSaKey = process.env["ssaSaKey"]

// dependabot_alert
let daEventHubUri = process.env["daEventHubUri"]
let daSaName = process.env["daSaName"]
let daSaKey = process.env["daSaKey"]

export default function (app: Probot) {
  app.onAny((context) => {
    app.log.debug(context.id)
    app.log.debug(context.name)
    app.log.debug(context.payload)
  })

  app.on("code_scanning_alert", async (context) => {
    if (csaEventHubUri && csaSaName && csaSaKey) {
      sendMessage(context, csaEventHubUri, csaSaName, csaSaKey)
    }
  })

  app.on("secret_scanning_alert", async (context) => {
    if (ssaEventHubUri && ssaSaName && ssaSaKey) {
      sendMessage(context, ssaEventHubUri, ssaSaName, ssaSaKey)
    }
  })

  app.on("dependabot_alert", async (context) => {
    if (daEventHubUri && daSaName && daSaKey) {
      sendMessage(context, daEventHubUri, daSaName, daSaKey)
    }
  })
}

async function sendMessage(context: EmitterWebhookEvent, eventHubUri: string, saName: string, saKey: string) {
  let sasToken = createSharedAccessToken(eventHubUri, saName, saKey)
  let response = await fetch(eventHubUri, {
    method: "POST",
    headers: {
      "Authorization": sasToken
    },
    body: JSON.stringify(context.payload)
  })
  if (response.status !== 201) {
    console.error(`HTTP error :: status:${response.status}  text:${response.text}`)
  }
}

function createSharedAccessToken(uri: string, saName: string, saKey: string) { 
  let encoded = encodeURIComponent(uri); 
  let now = new Date(); 
  let week = 60*60*24*7;
  let ttl = Math.round(now.getTime() / 1000) + week;
  let signature = encoded + "\n" + ttl; 
  let hash = crypto.createHmac("sha256", saKey).update(signature, "utf8").digest("base64"); 
  return "SharedAccessSignature sr=" + encoded + "&sig=" + encodeURIComponent(hash) + "&se=" + ttl + "&skn=" + saName; 
}

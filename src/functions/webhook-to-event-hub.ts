import { app } from "@azure/functions"
import aaf from "@probot/adapter-azure-functions"
import { pino } from "pino"
import { createWriteStream } from "pino-applicationinsights"
import probotapp from "./app.js"
import { env } from "process"


app.http('webhook-to-event-hub', {
  methods: ["POST"],
  authLevel: 'anonymous',
  handler: aaf.createAzureFunctionV4(probotapp, {
    probot: await createProbotWithLogger(),
  })
})

async function createProbotWithLogger() {
  let probot = new aaf.Probot({
    appId: env.APP_ID,
    secret: env.WEBHOOK_SECRET,
    privateKey: env.PRIVATE_KEY,
    webhookPath: env.WEBHOOK_PATH,
    log: pino(await createWriteStream())
  })
  return probot
}
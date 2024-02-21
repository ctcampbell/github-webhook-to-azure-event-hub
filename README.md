# GitHub Webhook to Azure Event Hub

An Azure function that recieves GitHub Webhooks and sends them to Azure Event Hubs. This is intended to allow ingestion of GitHub Advanced Security related webhook events `code_scanning_alert`, `secret_scanning_alert`, and `dependabot_alert`.

Events sent to an Event Hub instance can be ingested by tools such as Azure Data Explorer for reporting purposes.

## Requirements

1. An Azure Event Hub namespace with 3 event hub instances, one for each webhook event type listed above.
1. A shared access policy configured on each event hub instance, with at least `send` permission.
1. A GitHub app installed on an organisation, and configured to send webhook events to this deployed Azure Function.
1. This Azure Function deployed and configured with the application settings below
1. (Optional, but highly recommended) The Azure Function protected by a networking configuration that blocks access from all IPs except those listed in the `hooks` array at [https://api.github.com/meta](https://api.github.com/meta)

## How it works

This Azure Function accepts webhook events sent by GitHub, constructs an `Authorization` header and forwards the relevant event to the Azure Event Hubs REST API.

## Required Azure Function Application Settings

```yaml
    "APP_ID": "<your-github-app-id>",
    "WEBHOOK_SECRET": "<your-webhook-secret>",
    "PRIVATE_KEY": "<your-github-app-private-key>",
    "WEBHOOK_PATH": "/api/github/webhooks",
    "csaSaName": "<code-scanning-azure-event-hub-instance-shared-access-policy-name>",
    "csaSaKey": "<code-scanning-azure-event-hub-instance-shared-access-policy-key>",
    "csaEventHubUri": "https://<azure-event-hub-namespace>.servicebus.windows.net/code-scanning-event-hub-instance-name/messages",
    "ssaSaName": "<secret-scanning-azure-event-hub-instance-shared-access-policy-name>",
    "ssaSaKey": "<secret-scanning-azure-event-hub-instance-shared-access-policy-key>",
    "ssaEventHubUri": "https://<azure-event-hub-namespace>.servicebus.windows.net/<secret-scanning-azure-event-hub-instance-name>/messages",
    "daSaName": "<dependabot-azure-event-hub-instance-shared-access-policy-name>",
    "daSaKey": "<dependabot-azure-event-hub-instance-shared-access-policy-key>",
    "daEventHubUri": "https://<azure-event-hub-namespace>.servicebus.windows.net/<dependabot-azure-event-hub-instance-name>/messages"
```
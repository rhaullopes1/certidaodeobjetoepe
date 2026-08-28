import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('Missing required environment variables')
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const handler = createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': async (event) => {
              const { registrarDescadastro } = await import('@/lib/emails.server')
              await registrarDescadastro(event.data.recipient, 'bounce')
              console.log('Email bounced', { event_id: event.event_id })
            },
            'email.complaint': async (event) => {
              const { registrarDescadastro } = await import('@/lib/emails.server')
              await registrarDescadastro(event.data.recipient, 'complaint')
              console.log('Email complaint', { event_id: event.event_id })
            },
            'email.unsubscribed': async (event) => {
              const { registrarDescadastro } = await import('@/lib/emails.server')
              await registrarDescadastro(event.data.recipient, 'unsubscribe')
              console.log('Email unsubscribed', { event_id: event.event_id })
            },
          },
        })
        return handler(request)
      },
    },
  },
})

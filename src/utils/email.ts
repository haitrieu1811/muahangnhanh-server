import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import fs from 'fs'
import path from 'path'

import { ENV_CONFIG } from '~/constants/config'

// Create SES service object.
const sesClient = new SESClient({
  region: ENV_CONFIG.AWS_REGION,
  credentials: {
    secretAccessKey: ENV_CONFIG.AWS_SECRET_ACCESS_KEY,
    accessKeyId: ENV_CONFIG.AWS_ACCESS_KEY_ID
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

const sendMail = async (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: ENV_CONFIG.AWS_SES_FROM_ADDRESS,
    toAddresses: toAddress,
    body,
    subject
  })
  return sesClient.send(sendEmailCommand)
}

const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf-8')

export const sendVerifyEmail = async (toAddress: string, verifyEmailToken: string) => {
  return sendMail(
    toAddress,
    'Xác minh email của bạn',
    verifyEmailTemplate
      .replace('{{tittle}}', 'Xác minh email của bạn.')
      .replace(
        '{{content}}',
        'Nếu bạn là người tạo tài khoản thông qua email này thì vui lòng xác minh email này để sử dụng dịch vụ của chúng tôi, nếu không vui lòng bỏ qua mail này.'
      )
      .replace('{{href}}', `${ENV_CONFIG.CLIENT_HOST}/verify-email?token=${verifyEmailToken}`)
  )
}

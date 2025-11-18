import nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'

// Create email transporter
let transporter = null

const initializeEmailService = () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    console.log('✅ Email service initialized')
  } else {
    console.log('⚠️  Email service not configured - using mock mode')
  }
}

// Initialize on module load
initializeEmailService()

export const sendInvitationEmail = async (recipientEmail, inviterName, eventName, invitationToken) => {
  const subject = `🎅 You're invited to join "${eventName}" Secret Santa!`
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const invitationUrl = `${frontendUrl}/register?invitation=${invitationToken}`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; color: white; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 2.5rem;">🎅 Secret Santa Invitation</h1>
        <p style="margin: 10px 0 0 0; font-size: 1.2rem; opacity: 0.9;">You've been invited to join the holiday fun!</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin-bottom: 20px;">Hi there! 👋</h2>
        
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
          <strong>${inviterName}</strong> has invited you to join their Secret Santa event: <strong>"${eventName}"</strong>
        </p>
        
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 30px;">
          Create your account, build your Christmas wishlist, and get ready for the gift exchange! 🎁
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationUrl}" 
             style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            Join Secret Santa 🎄
          </a>
        </div>
        
        <p style="color: #718096; font-size: 14px; line-height: 1.6;">
          If the button doesn't work, you can copy and paste this link into your browser:<br>
          <a href="${invitationUrl}" style="color: #667eea; word-break: break-all;">${invitationUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #a0aec0; font-size: 12px; text-align: center;">
          This invitation was sent from the Secret Santa app. If you didn't expect this email, you can safely ignore it.
        </p>
      </div>
    </div>
  `

  const textContent = `
    🎅 Secret Santa Invitation

    Hi there!

    ${inviterName} has invited you to join their Secret Santa event: "${eventName}"

    Create your account, build your Christmas wishlist, and get ready for the gift exchange!

    Join here: ${invitationUrl}

    Happy Holidays! 🎄
  `

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Secret Santa <noreply@secretsanta.com>',
        to: recipientEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      })

      console.log('✅ Email sent successfully:', info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('❌ Email send error:', error)
      throw new Error('Failed to send email')
    }
  } else {
    // Mock email sending for development
    console.log('📧 Mock Email Sent:')
    console.log(`To: ${recipientEmail}`)
    console.log(`Subject: ${subject}`)
    console.log(`Invitation URL: ${invitationUrl}`)
    console.log('---')
    
    return { success: true, messageId: 'mock-' + uuidv4() }
  }
}

export const sendAssignmentEmail = async (recipientEmail, recipientName, assignedPersonName, eventName) => {
  const subject = `🎁 Your Secret Santa Assignment for "${eventName}"`
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const dashboardUrl = `${frontendUrl}/dashboard`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; border-radius: 15px; text-align: center; color: white; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 2.5rem;">🎁 Secret Santa Assignment</h1>
        <p style="margin: 10px 0 0 0; font-size: 1.2rem; opacity: 0.9;">Your secret assignment is ready!</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin-bottom: 20px;">Ho ho ho, ${recipientName}! 🎅</h2>
        
        <div style="background: #f0fff4; border: 2px solid #68d391; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
          <h3 style="color: #22543d; margin-bottom: 10px;">Your Secret Santa Assignment:</h3>
          <p style="font-size: 1.5rem; font-weight: bold; color: #2f855a; margin: 0;">
            ${assignedPersonName}
          </p>
        </div>
        
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
          Shhh... it's a secret! 🤫 You're now the Secret Santa for <strong>${assignedPersonName}</strong> in the "${eventName}" event.
        </p>
        
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 30px;">
          Visit your dashboard to view their Christmas wishlist and find the perfect gift!
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="background: #48bb78; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
            View Dashboard 🎄
          </a>
        </div>
        
        <div style="background: #fffbeb; border: 2px solid #f6e05e; border-radius: 10px; padding: 15px; margin: 20px 0;">
          <p style="color: #744210; margin: 0; font-size: 14px;">
            <strong>Remember:</strong> Keep your assignment secret! The magic of Secret Santa is in the surprise. 🎭
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        
        <p style="color: #a0aec0; font-size: 12px; text-align: center;">
          Happy gifting! 🎁 May your Secret Santa adventure be merry and bright.
        </p>
      </div>
    </div>
  `

  const textContent = `
    🎁 Your Secret Santa Assignment for "${eventName}"

    Ho ho ho, ${recipientName}!

    Your Secret Santa assignment: ${assignedPersonName}

    Shhh... it's a secret! You're now the Secret Santa for ${assignedPersonName}.

    Visit your dashboard to view their Christmas wishlist and find the perfect gift!

    Dashboard: ${dashboardUrl}

    Remember: Keep your assignment secret! The magic of Secret Santa is in the surprise.

    Happy gifting! 🎁
  `

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Secret Santa <noreply@secretsanta.com>',
        to: recipientEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      })

      console.log('✅ Assignment email sent successfully:', info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('❌ Assignment email send error:', error)
      throw new Error('Failed to send assignment email')
    }
  } else {
    // Mock email sending for development
    console.log('📧 Mock Assignment Email Sent:')
    console.log(`To: ${recipientEmail}`)
    console.log(`Subject: ${subject}`)
    console.log(`Assignment: ${assignedPersonName}`)
    console.log('---')
    
    return { success: true, messageId: 'mock-assignment-' + uuidv4() }
  }
}
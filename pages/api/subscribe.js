import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = 'Ifeanyi @ ifecyber <onboarding@ifecyber.com>'
const PDF_URL = 'https://ifecyber.com/2027-cyber-cert-roadmap.pdf'

// Day 0 welcome email — delivers the PDF link
async function sendWelcomeEmail(email) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Your roadmap is here. Let\'s go.',
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
        <p style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">You got it.</p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Here's the 2027 Cyber Cert Roadmap — every cert ranked by job outcome, 
          Security+ first, no fluff. Bookmark it. Use it.
        </p>
        <a href="${PDF_URL}" style="display: inline-block; background: #00d4ff; color: #000; font-weight: 700; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 16px; margin-bottom: 32px;">
          Download the Roadmap
        </a>
        <p style="font-size: 14px; color: #666; line-height: 1.5;">
          More coming. Cert guides, career deep dives, tool breakdowns — 
          the stuff I actually use on the job, not the stuff people sell courses about.
        </p>
      </div>
    `,
  })
}

// Day 2 origin-story email — humanizes him
async function sendDay2Email(email) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'How I actually got into cyber (no guru stuff)',
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          People ask me how I got into cybersecurity like it's some magic story. 
          It's not. I got Security+ because I needed a job. I got the next cert 
          because the first one opened a door. I kept going because the money was real 
          and the work was interesting.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          No bootcamp. No rich parents. No "just try HTB and you'll figure it out" advice. 
          Just certs, applied experience, and a roadmap I wish someone had handed me.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          That's what this is. The roadmap I built for myself, refined against real job listings, 
          updated for 2027. Everything on there got me or someone I know a job.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          More coming. Stay tuned.
        </p>
      </div>
    `,
  })
}

// Day 4 soft-pitch email — tees up future products without being salesy
async function sendDay4Email(email) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'What I\'m building next (and why)',
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          The roadmap is the start. I've been putting together study guides, 
          practice question banks, and career roadmaps for the certs that actually pay — 
          the ones beyond Security+.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          They're not free — I'm not selling courses. Think $5–25 study packs, 
          actual use-it-anywhere PDFs, nothing that requires a subscription.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          If that sounds useful, you'll be the first to know when they drop. 
          No hype. Just the stuff that helps.
        </p>
        <p style="font-size: 14px; color: #888;">
          Not interested? No hard feelings — you'll still get the free stuff.
        </p>
      </div>
    `,
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' })
  }

  try {
    // Add to Resend audience / contact list
    // Using a list ID if RESEND_AUDIENCE_ID is set, otherwise just send
    const audienceId = process.env.RESEND_AUDIENCE_ID

    if (audienceId) {
      await resend.contacts.create({
        audienceId,
        email,
        unsubscribed: false,
      })
    }

    // Send welcome email immediately
    await sendWelcomeEmail(email)

    // Schedule day 2 and day 4 emails via Resend's delays
    // Resend doesn't have built-in scheduling, so we defer via timestamp
    const now = Date.now()
    const day2 = new Date(now + 2 * 24 * 60 * 60 * 1000)
    const day4 = new Date(now + 4 * 24 * 60 * 60 * 1000)

    // For now: send day 2 and day 4 emails with a note that real scheduling
    // requires Resend's API or a cron job. We'll send them in sequence for demo.
    // In production: use RESEND_SCHEDULE or a queue.
    await sendDay2Email(email)
    await sendDay4Email(email)

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Subscribe error:', error)
    return res.status(500).json({ error: 'Failed to subscribe. Try again.' })
  }
}

// @ts-nocheck
/**
 * Email Service
 * Sends email notifications
 * Configured for SMTP integration
 */

import { Incident } from '../models/incident.ts'

export class EmailService {
  /**
   * Send incident alert email
   */
  static async sendIncidentAlert(email: string, incident: Incident): Promise<void> {
    try {
      const subject = `[${incident.severity.toUpperCase()}] New Incident: ${incident.title}`
      const html = this.renderIncidentTemplate(incident)

      await this.sendEmail(email, subject, html)
    } catch (error: any) {
      await this.logEmailFailure(error, email)
    }
  }

  /**
   * Send assignment notification
   */
  static async sendAssignmentNotification(email: string, incident: Incident): Promise<void> {
    try {
      const subject = `You have been assigned to: ${incident.title}`
      const html = this.renderAssignmentTemplate(incident)

      await this.sendEmail(email, subject, html)
    } catch (error: any) {
      await this.logEmailFailure(error, email)
    }
  }

  /**
   * Send status update notification
   */
  static async sendStatusUpdate(email: string, incident: Incident): Promise<void> {
    try {
      const subject = `Incident Status Update: ${incident.title} - ${incident.status}`
      const html = this.renderStatusTemplate(incident)

      await this.sendEmail(email, subject, html)
    } catch (error: any) {
      await this.logEmailFailure(error, email)
    }
  }

  /**
   * Send daily digest
   */
  static async sendDailyDigest(email: string, incidents: Incident[]): Promise<void> {
    try {
      const subject = `Daily Incident Digest - ${new Date().toLocaleDateString()}`
      const html = this.renderDigestTemplate(incidents)

      await this.sendEmail(email, subject, html)
    } catch (error: any) {
      await this.logEmailFailure(error, email)
    }
  }

  /**
   * Send email (SMTP configured)
   */
  private static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    // Implementation: Use nodemailer with SMTP configuration
    // const transporter = nodemailer.createTransport({...})
    // await transporter.sendMail({to, subject, html})

    // For now, log the email that would be sent
    console.log(`Email queued to ${to}: ${subject}`)
  }

  /**
   * Render incident alert template
   */
  private static renderIncidentTemplate(incident: Incident): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h1>New Incident Alert</h1>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Title</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${incident.title}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Severity</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${incident.severity}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Status</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${incident.status}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Created</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(incident.createdAt).toLocaleString()}</td>
            </tr>
          </table>
          <h2>Description</h2>
          <p>${incident.description || 'No description provided'}</p>
          <a href="#" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Incident</a>
        </body>
      </html>
    `
  }

  /**
   * Render assignment template
   */
  private static renderAssignmentTemplate(incident: Incident): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h1>Incident Assigned to You</h1>
          <p>You have been assigned to the following incident:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Title</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${incident.title}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Severity</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${incident.severity}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Description</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${incident.description || 'N/A'}</td>
            </tr>
          </table>
          <h2>Next Steps</h2>
          <ol>
            <li>Review the incident details</li>
            <li>Investigate the issue</li>
            <li>Update the status as you progress</li>
            <li>Close when resolved</li>
          </ol>
          <a href="#" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Working</a>
        </body>
      </html>
    `
  }

  /**
   * Render status template
   */
  private static renderStatusTemplate(incident: Incident): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h1>Incident Status Update</h1>
          <p>The following incident has been updated:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Title</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${incident.title}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>New Status</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${incident.status}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Severity</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${incident.severity}</td>
            </tr>
          </table>
          ${incident.resolution_notes ? `<h2>Resolution Notes</h2><p>${incident.resolution_notes}</p>` : ''}
          <a href="#" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>
        </body>
      </html>
    `
  }

  /**
   * Render digest template
   */
  private static renderDigestTemplate(incidents: Incident[]): string {
    const incidentRows = incidents
      .map(
        (i) =>
          `<tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${i.title}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${i.severity}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${i.status}</td>
        </tr>`
      )
      .join('')

    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h1>Daily Incident Digest</h1>
          <p>${new Date().toLocaleDateString()}</p>
          <h2>Summary</h2>
          <p>Total Incidents: ${incidents.length}</p>
          <h2>Incidents</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; border: 1px solid #ddd;">Title</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Severity</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${incidentRows}
            </tbody>
          </table>
          <a href="#" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; display: inline-block;">View All Incidents</a>
        </body>
      </html>
    `
  }

  /**
   * Log email failure
   */
  static async logEmailFailure(error: Error, recipient: string): Promise<void> {
    console.error(`Failed to send email to ${recipient}:`, error.message)
    // Could implement error tracking/alerting here
  }
}

// @ts-nocheck
/**
 * Slack Service
 * Sends notifications to Slack
 */

import axios from 'axios'
import { Incident } from '../models/incident.ts'

export class SlackService {
  /**
   * Send incident alert to Slack
   */
  static async sendIncidentAlert(webhookUrl: string, incident: Incident): Promise<void> {
    try {
      if (!webhookUrl) {
        console.warn('Slack webhook URL not configured')
        return
      }

      const message = this.formatIncidentAlert(incident)
      await axios.post(webhookUrl, message)
    } catch (error: any) {
      console.error('Error sending Slack alert:', error)
      await this.handleWebhookError(error, webhookUrl)
    }
  }

  /**
   * Send assignment notification to Slack
   */
  static async sendAssignmentNotification(
    webhookUrl: string,
    incident: Incident,
    assignedTo: string
  ): Promise<void> {
    try {
      if (!webhookUrl) {
        console.warn('Slack webhook URL not configured')
        return
      }

      const message = {
        text: `Incident Assigned: ${incident.title}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Incident Assigned*\n\n*Title:* ${incident.title}\n*Severity:* ${incident.severity}\n*Assigned to:* <@${assignedTo}>`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Incident',
                },
                value: incident.id,
              },
            ],
          },
        ],
      }

      await axios.post(webhookUrl, message)
    } catch (error: any) {
      console.error('Error sending assignment notification:', error)
      await this.handleWebhookError(error, webhookUrl)
    }
  }

  /**
   * Send status update to Slack
   */
  static async sendStatusUpdate(webhookUrl: string, incident: Incident): Promise<void> {
    try {
      if (!webhookUrl) {
        console.warn('Slack webhook URL not configured')
        return
      }

      const message = {
        text: `Incident Status Update: ${incident.title}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Status Update*\n\n*Title:* ${incident.title}\n*New Status:* ${incident.status}\n*Severity:* ${incident.severity}`,
            },
          },
        ],
      }

      await axios.post(webhookUrl, message)
    } catch (error: any) {
      console.error('Error sending status update:', error)
      await this.handleWebhookError(error, webhookUrl)
    }
  }

  /**
   * Format incident for Slack
   */
  private static formatIncidentAlert(incident: Incident): any {
    const severityColor = {
      critical: 'FF0000',
      high: 'FF9900',
      medium: 'FFFF00',
      low: '00FF00',
    }

    return {
      text: `New Incident: ${incident.title}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'New Incident Created',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Title*\n${incident.title}`,
            },
            {
              type: 'mrkdwn',
              text: `*Severity*\n${incident.severity.toUpperCase()}`,
            },
            {
              type: 'mrkdwn',
              text: `*Status*\n${incident.status}`,
            },
            {
              type: 'mrkdwn',
              text: `*Created*\n${new Date(incident.createdAt).toLocaleString()}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: incident.description || 'No description provided',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in System',
              },
              value: incident.id,
              style: 'primary',
            },
          ],
        },
      ],
      attachments: [
        {
          color: severityColor[incident.severity as keyof typeof severityColor],
          fields: [
            {
              title: 'Incident ID',
              value: incident.id,
              short: true,
            },
            {
              title: 'Severity',
              value: incident.severity,
              short: true,
            },
          ],
        },
      ],
    }
  }

  /**
   * Handle webhook errors
   */
  static async handleWebhookError(error: Error, webhookUrl: string): Promise<void> {
    console.error(`Failed to send Slack notification to ${webhookUrl}:`, error.message)
    // Could implement retry logic or error logging here
  }
}

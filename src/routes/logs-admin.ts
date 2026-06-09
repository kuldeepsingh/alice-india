// @ts-nocheck
import { Router, Request, Response } from 'express'
import { loggingService } from '../services/logging-service.ts'
import { requireAdmin } from '../middleware/auth.ts'

const router = Router()

// Get paginated logs
router.get('/admin/logs', requireAdmin, (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000)
    const offset = parseInt(req.query.offset as string) || 0
    const level = req.query.level as string
    const service = req.query.service as string
    const search = req.query.search as string

    const result = loggingService.readLogs({
      limit,
      offset,
      level: level as any,
      service,
      search,
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' })
  }
})

// Get log file stats and list
router.get('/admin/logs/stats', requireAdmin, (req: Request, res: Response) => {
  try {
    const stats = loggingService.getLogStats()
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch log stats' })
  }
})

// Download specific log file
router.get('/admin/logs/download/:filename', requireAdmin, (req: Request, res: Response) => {
  try {
    const content = loggingService.getLogFileContent(req.params.filename)

    if (!content) {
      return res.status(404).json({ error: 'Log file not found' })
    }

    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`)
    res.send(content)
  } catch (error) {
    res.status(500).json({ error: 'Failed to download log file' })
  }
})

// Clear old logs (admin only)
router.post('/admin/logs/clear', requireAdmin, (req: Request, res: Response) => {
  try {
    const daysToKeep = req.body.daysToKeep || 30
    const deletedCount = loggingService.clearOldLogs(daysToKeep)

    res.json({
      message: `Cleared ${deletedCount} old log files`,
      deletedCount,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear logs' })
  }
})

export default router

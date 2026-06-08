import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Divider } from '@mui/material'
import { Close } from '@mui/icons-material'
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from '../theme-pro'
import { helpContent } from '../content/helpContent'

interface HelpModalProps {
  open: boolean
  onClose: () => void
  currentPage: string
}

export function HelpModal({ open, onClose, currentPage }: HelpModalProps) {
  const help = helpContent[currentPage] || helpContent['/']
  const { title, sections } = help

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: RADIUS_PRO.lg,
          backgroundColor: THEME_PRO.bgSecondary,
          border: `1px solid ${THEME_PRO.border}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: THEME_PRO.textPrimary,
          fontWeight: 700,
          fontSize: '18px',
          borderBottom: `1px solid ${THEME_PRO.border}`,
        }}
      >
        {title}
        <Button onClick={onClose} sx={{ minWidth: 0, p: 0 }}>
          <Close sx={{ color: THEME_PRO.textSecondary }} />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: SPACING_PRO.lg, pb: SPACING_PRO.lg }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING_PRO.lg }}>
          {sections.map((section, idx) => (
            <Box key={idx}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: THEME_PRO.primary,
                  mb: SPACING_PRO.sm,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {section.heading}
              </Typography>
              <Typography
                sx={{
                  fontSize: '13px',
                  color: THEME_PRO.textSecondary,
                  lineHeight: 1.6,
                  mb: SPACING_PRO.md,
                }}
              >
                {section.content}
              </Typography>
              {idx < sections.length - 1 && (
                <Divider sx={{ borderColor: THEME_PRO.border, my: SPACING_PRO.sm }} />
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: `1px solid ${THEME_PRO.border}`, p: SPACING_PRO.lg, gap: SPACING_PRO.sm }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: THEME_PRO.primary,
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            flex: 1,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

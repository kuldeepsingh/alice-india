import React, { useState } from "react";
import { LayoutPro } from "../components/LayoutPro";
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
} from "@mui/material";
import { CloudDone, CloudOff, LinkIcon } from "@mui/icons-material";
import { THEME_PRO, SPACING_PRO, RADIUS_PRO } from "../theme-pro";

const mockAccounts = [
  {
    id: 1,
    accountNumber: "ACC-2026-00001",
    owner: "Rajesh Kumar",
    type: "Live",
    balance: "₹125,450",
    equity: "₹118,900",
    openPositions: 5,
    status: "Active",
    zerodhaStatus: null,
  },
  {
    id: 2,
    accountNumber: "ACC-2026-00002",
    owner: "Priya Sharma",
    type: "Demo",
    balance: "₹50,000",
    equity: "₹48,500",
    openPositions: 2,
    status: "Active",
    zerodhaStatus: null,
  },
  {
    id: 3,
    accountNumber: "ACC-2026-00003",
    owner: "Amit Patel",
    type: "Live",
    balance: "₹75,300",
    equity: "₹72,100",
    openPositions: 0,
    status: "Inactive",
    zerodhaStatus: null,
  },
];

export function AccountsPage() {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [connecting, setConnecting] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleConnectZerodha = async (accountId: number) => {
    setConnecting(accountId);
    try {
      const response = await fetch(`/api/v1/zerodha/connect/${accountId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Update account with Zerodha status
        setAccounts(
          accounts.map((acc) =>
            acc.id === accountId ? { ...acc, zerodhaStatus: "synced" } : acc,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to connect Zerodha:", error);
      setAccounts(
        accounts.map((acc) =>
          acc.id === accountId ? { ...acc, zerodhaStatus: "error" } : acc,
        ),
      );
    } finally {
      setConnecting(null);
    }
  };

  const handleViewDetails = async (account: any) => {
    setSelectedAccount(account);
    setShowDetails(true);
  };

  return (
    <LayoutPro>
      <Box
        sx={{
          p: SPACING_PRO.xxxl,
          backgroundColor: THEME_PRO.bgPrimary,
          minHeight: "100vh",
        }}
      >
        <Box sx={{ mb: SPACING_PRO.xxxl }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: "32px",
              fontWeight: 700,
              color: THEME_PRO.textPrimary,
              mb: SPACING_PRO.md,
            }}
          >
            💼 Trading Accounts
          </Typography>
          <Typography sx={{ color: THEME_PRO.textSecondary }}>
            View all trading accounts linked to users
          </Typography>
        </Box>

        <Card
          sx={{
            borderRadius: RADIUS_PRO.lg,
            border: `1px solid ${THEME_PRO.border}`,
            overflow: "hidden",
            backgroundColor: THEME_PRO.bgSecondary,
          }}
        >
          <TableContainer sx={{ backgroundColor: THEME_PRO.bgSecondary }}>
            <Table>
              <TableHead sx={{ backgroundColor: THEME_PRO.bgTertiary }}>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}
                  >
                    Account Number
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}
                  >
                    Owner
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}
                  >
                    Zerodha
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: THEME_PRO.textPrimary }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((acc) => (
                  <TableRow
                    key={acc.id}
                    sx={{
                      borderBottom: `1px solid ${THEME_PRO.border}`,
                      backgroundColor: THEME_PRO.bgSecondary,
                    }}
                  >
                    <TableCell
                      sx={{ color: THEME_PRO.primary, fontWeight: 700 }}
                    >
                      {acc.accountNumber}
                    </TableCell>
                    <TableCell
                      sx={{ color: THEME_PRO.textPrimary, fontWeight: 600 }}
                    >
                      {acc.owner}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={acc.type}
                        sx={{
                          backgroundColor:
                            acc.type === "Live"
                              ? THEME_PRO.errorLight
                              : THEME_PRO.successLight,
                          color:
                            acc.type === "Live"
                              ? THEME_PRO.error
                              : THEME_PRO.success,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={acc.status}
                        sx={{
                          backgroundColor:
                            acc.status === "Active"
                              ? THEME_PRO.successLight
                              : THEME_PRO.bgTertiary,
                          color:
                            acc.status === "Active"
                              ? THEME_PRO.success
                              : THEME_PRO.textSecondary,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {acc.zerodhaStatus ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: SPACING_PRO.sm,
                          }}
                        >
                          <CloudDone
                            sx={{ color: THEME_PRO.success, fontSize: "18px" }}
                          />
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: THEME_PRO.success,
                              fontWeight: 600,
                            }}
                          >
                            Connected
                          </Typography>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: SPACING_PRO.sm,
                          }}
                        >
                          <CloudOff
                            sx={{
                              color: THEME_PRO.textSecondary,
                              fontSize: "18px",
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: THEME_PRO.textSecondary,
                            }}
                          >
                            Not Connected
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {!acc.zerodhaStatus ? (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={
                            connecting === acc.id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <LinkIcon />
                            )
                          }
                          onClick={() => handleConnectZerodha(acc.id)}
                          disabled={connecting === acc.id}
                          sx={{
                            backgroundColor: THEME_PRO.primary,
                            color: "#fff",
                            fontSize: "11px",
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          {connecting === acc.id
                            ? "Connecting..."
                            : "Connect Zerodha"}
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(acc)}
                          sx={{
                            borderColor: THEME_PRO.primary,
                            color: THEME_PRO.primary,
                            fontSize: "11px",
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          View Data
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Zerodha Details Dialog */}
        <Dialog
          open={showDetails}
          onClose={() => setShowDetails(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              backgroundColor: THEME_PRO.bgTertiary,
              color: THEME_PRO.textPrimary,
              fontWeight: 700,
            }}
          >
            📊 Zerodha Broker Data - {selectedAccount?.accountNumber}
          </DialogTitle>
          <DialogContent
            sx={{ backgroundColor: THEME_PRO.bgSecondary, p: SPACING_PRO.lg }}
          >
            <Box sx={{ mt: SPACING_PRO.lg }}>
              <Alert severity="info" sx={{ mb: SPACING_PRO.lg }}>
                This is dummy data showing how real Zerodha data would appear.
                In production, this connects to your actual Zerodha account via
                OAuth 2.0.
              </Alert>

              {/* Holdings */}
              <Typography
                variant="h6"
                sx={{
                  color: THEME_PRO.textPrimary,
                  fontWeight: 700,
                  mb: SPACING_PRO.md,
                }}
              >
                📈 Holdings
              </Typography>
              <Box
                sx={{
                  mb: SPACING_PRO.xl,
                  backgroundColor: THEME_PRO.bgTertiary,
                  p: SPACING_PRO.md,
                  borderRadius: "8px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: THEME_PRO.textSecondary,
                    mb: SPACING_PRO.sm,
                  }}
                >
                  Stocks owned in your Zerodha account:
                </Typography>
                <Typography
                  sx={{ fontSize: "13px", color: THEME_PRO.textPrimary }}
                >
                  • INFY: 50 shares @ ₹1,850 avg (Current: ₹1,920, P&L: +₹3,500)
                  <br />
                  • TCS: 25 shares @ ₹3,450 avg (Current: ₹3,680, P&L: +₹5,750)
                  <br />
                  • RELIANCE: 100 shares @ ₹2,890 avg (Current: ₹3,150, P&L:
                  +₹26,000)
                  <br />
                  • WIPRO: 200 shares @ ₹380 avg (Current: ₹425, P&L: +₹9,000)
                  <br />• ICICBANK: 75 shares @ ₹1,125 avg (Current: ₹1,250,
                  P&L: +₹9,375)
                </Typography>
              </Box>

              {/* Account Balance */}
              <Typography
                variant="h6"
                sx={{
                  color: THEME_PRO.textPrimary,
                  fontWeight: 700,
                  mb: SPACING_PRO.md,
                }}
              >
                💰 Account Balance
              </Typography>
              <Box
                sx={{
                  mb: SPACING_PRO.xl,
                  backgroundColor: THEME_PRO.bgTertiary,
                  p: SPACING_PRO.md,
                  borderRadius: "8px",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: SPACING_PRO.lg,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: THEME_PRO.textSecondary,
                        mb: "4px",
                      }}
                    >
                      Cash Available
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: THEME_PRO.primary,
                      }}
                    >
                      ₹2,50,000
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: THEME_PRO.textSecondary,
                        mb: "4px",
                      }}
                    >
                      Total Equity
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: THEME_PRO.success,
                      }}
                    >
                      ₹8,50,000
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: THEME_PRO.textSecondary,
                        mb: "4px",
                      }}
                    >
                      Available Margin
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: THEME_PRO.primary,
                      }}
                    >
                      ₹12,50,000
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: THEME_PRO.textSecondary,
                        mb: "4px",
                      }}
                    >
                      Net Worth
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: THEME_PRO.textPrimary,
                      }}
                    >
                      ₹11,00,000
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: THEME_PRO.textSecondary,
                        mb: "4px",
                      }}
                    >
                      Unrealised P&L
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: THEME_PRO.success,
                      }}
                    >
                      +₹54,625
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: THEME_PRO.textSecondary,
                        mb: "4px",
                      }}
                    >
                      Realised P&L
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: THEME_PRO.success,
                      }}
                    >
                      +₹15,800
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Recent Orders */}
              <Typography
                variant="h6"
                sx={{
                  color: THEME_PRO.textPrimary,
                  fontWeight: 700,
                  mb: SPACING_PRO.md,
                }}
              >
                📋 Recent Orders
              </Typography>
              <Box
                sx={{
                  backgroundColor: THEME_PRO.bgTertiary,
                  p: SPACING_PRO.md,
                  borderRadius: "8px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: THEME_PRO.textPrimary,
                    mb: SPACING_PRO.sm,
                  }}
                >
                  ORD001: INFY - Buy 50 @ ₹1,850 [COMPLETE]
                  <br />
                  ORD002: TCS - Buy 25 @ ₹3,450 [COMPLETE]
                  <br />
                  ORD003: RELIANCE - Buy 100 @ ₹2,890 [COMPLETE]
                  <br />
                  ORD004: ICICBANK - Sell 50 @ ₹1,125 [PENDING]
                </Typography>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </LayoutPro>
  );
}

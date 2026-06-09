import React, { useState, useEffect } from "react";
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
import { accountsAPI, zerodhaAPI } from "../services/api-services";

export function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [zerodhaData, setZerodhaData] = useState<any>({
    holdings: [],
    orders: [],
    balance: null,
  });
  const [loadingZerodhaData, setLoadingZerodhaData] = useState(false);

  // Load accounts from backend on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await accountsAPI.getAll();
        setAccounts(data);
      } catch (err) {
        setError("Failed to load accounts. Please try again.");
        console.error("Error fetching accounts:", err);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleConnectZerodha = async (accountId: string) => {
    setConnecting(accountId);
    try {
      await zerodhaAPI.connect(accountId);
      // Update account with Zerodha status
      setAccounts(
        accounts.map((acc) =>
          acc.id === accountId ? { ...acc, zerodhaStatus: "synced" } : acc
        )
      );
    } catch (error) {
      console.error("Failed to connect Zerodha:", error);
      setAccounts(
        accounts.map((acc) =>
          acc.id === accountId ? { ...acc, zerodhaStatus: "error" } : acc
        )
      );
    } finally {
      setConnecting(null);
    }
  };

  const handleViewDetails = async (account: any) => {
    setSelectedAccount(account);
    setLoadingZerodhaData(true);

    try {
      const [holdings, orders, balance] = await Promise.all([
        zerodhaAPI.getHoldings(account.id),
        zerodhaAPI.getOrders(account.id),
        zerodhaAPI.getBalance(account.id),
      ]);

      setZerodhaData({ holdings, orders, balance });
      setShowDetails(true);
    } catch (err) {
      console.error("Error loading Zerodha data:", err);
      setZerodhaData({ holdings: [], orders: [], balance: null });
      setShowDetails(true);
    } finally {
      setLoadingZerodhaData(false);
    }
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

        {error && (
          <Alert
            sx={{
              mb: SPACING_PRO.lg,
              backgroundColor: THEME_PRO.errorLight,
              color: THEME_PRO.error,
              border: `1px solid ${THEME_PRO.error}`,
            }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: SPACING_PRO.xxxl }}>
            <CircularProgress sx={{ color: THEME_PRO.primary }} />
          </Box>
        ) : accounts.length === 0 ? (
          <Card
            sx={{
              p: SPACING_PRO.xxxl,
              borderRadius: RADIUS_PRO.lg,
              backgroundColor: THEME_PRO.bgSecondary,
              border: `1px solid ${THEME_PRO.border}`,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ color: THEME_PRO.textSecondary }}>
                No accounts found
              </Typography>
            </Box>
          </Card>
        ) : (
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
                              sx={{
                                color: THEME_PRO.success,
                                fontSize: "18px",
                              }}
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
        )}

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
            {loadingZerodhaData ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: SPACING_PRO.xxxl }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ mt: SPACING_PRO.lg }}>
                <Alert severity="info" sx={{ mb: SPACING_PRO.lg }}>
                  Real-time data synced from your Zerodha account via OAuth 2.0.
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
                  📈 Holdings ({zerodhaData.holdings.length})
                </Typography>
                <Box
                  sx={{
                    mb: SPACING_PRO.xl,
                    backgroundColor: THEME_PRO.bgTertiary,
                    p: SPACING_PRO.md,
                    borderRadius: "8px",
                  }}
                >
                  {zerodhaData.holdings.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: SPACING_PRO.sm }}>
                      {zerodhaData.holdings.map((holding: any) => (
                        <Typography key={holding.id} sx={{ fontSize: "13px", color: THEME_PRO.textPrimary }}>
                          • {holding.symbol}: {holding.quantity} shares @ ₹{holding.averagePrice?.toLocaleString?.()} avg (Current: ₹{holding.currentPrice?.toLocaleString?.()}, P&L: ₹{holding.pnl?.toLocaleString?.()})
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: "13px", color: THEME_PRO.textSecondary }}>
                      No holdings data available
                    </Typography>
                  )}
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
                  {zerodhaData.balance ? (
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING_PRO.lg }}>
                      <Box>
                        <Typography
                          sx={{ fontSize: "12px", color: THEME_PRO.textSecondary, mb: "4px" }}
                        >
                          Cash Available
                        </Typography>
                        <Typography
                          sx={{ fontSize: "16px", fontWeight: 700, color: THEME_PRO.primary }}
                        >
                          ₹{zerodhaData.balance.cash?.toLocaleString?.()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{ fontSize: "12px", color: THEME_PRO.textSecondary, mb: "4px" }}
                        >
                          Total Equity
                        </Typography>
                        <Typography
                          sx={{ fontSize: "16px", fontWeight: 700, color: THEME_PRO.success }}
                        >
                          ₹{zerodhaData.balance.equity?.toLocaleString?.()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{ fontSize: "12px", color: THEME_PRO.textSecondary, mb: "4px" }}
                        >
                          Available Margin
                        </Typography>
                        <Typography
                          sx={{ fontSize: "16px", fontWeight: 700, color: THEME_PRO.primary }}
                        >
                          ₹{zerodhaData.balance.availableMargin?.toLocaleString?.()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{ fontSize: "12px", color: THEME_PRO.textSecondary, mb: "4px" }}
                        >
                          Net Worth
                        </Typography>
                        <Typography
                          sx={{ fontSize: "16px", fontWeight: 700, color: THEME_PRO.textPrimary }}
                        >
                          ₹{zerodhaData.balance.netWorth?.toLocaleString?.()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{ fontSize: "12px", color: THEME_PRO.textSecondary, mb: "4px" }}
                        >
                          Unrealised P&L
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: zerodhaData.balance.unrealisedPnl >= 0 ? THEME_PRO.success : THEME_PRO.error,
                          }}
                        >
                          {zerodhaData.balance.unrealisedPnl >= 0 ? "+" : ""}₹{zerodhaData.balance.unrealisedPnl?.toLocaleString?.()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{ fontSize: "12px", color: THEME_PRO.textSecondary, mb: "4px" }}
                        >
                          Realised P&L
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: zerodhaData.balance.realisedPnl >= 0 ? THEME_PRO.success : THEME_PRO.error,
                          }}
                        >
                          {zerodhaData.balance.realisedPnl >= 0 ? "+" : ""}₹{zerodhaData.balance.realisedPnl?.toLocaleString?.()}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: "13px", color: THEME_PRO.textSecondary }}>
                      No balance data available
                    </Typography>
                  )}
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
                  📋 Recent Orders ({zerodhaData.orders.length})
                </Typography>
                <Box
                  sx={{
                    backgroundColor: THEME_PRO.bgTertiary,
                    p: SPACING_PRO.md,
                    borderRadius: "8px",
                  }}
                >
                  {zerodhaData.orders.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: SPACING_PRO.sm }}>
                      {zerodhaData.orders.slice(0, 10).map((order: any) => (
                        <Typography key={order.zerodhaOrderId} sx={{ fontSize: "13px", color: THEME_PRO.textPrimary }}>
                          {order.zerodhaOrderId}: {order.symbol} - {order.side} {order.quantity} @ ₹{order.price?.toLocaleString?.()} [{order.status}]
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: "13px", color: THEME_PRO.textSecondary }}>
                      No orders data available
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </LayoutPro>
  );
}

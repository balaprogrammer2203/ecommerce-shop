import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Link as MuiLink,
  Stack,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
} from '@mui/material';
import { ThemeProvider, alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { appTheme } from '../../theme';

export const AdminLayout = () => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  // Enterprise UX:
  // - Large desktop: always expanded sidebar.
  // - Tablet/laptop: mini/collapsed mode supported.
  // - Mobile: temporary overlay drawer.
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => [
      {
        label: 'Dashboard',
        to: '/admin',
        end: true,
        icon: <DashboardRoundedIcon sx={{ fontSize: 18 }} />,
      },
      {
        label: 'User',
        to: '/admin/users',
        end: false,
        icon: <PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />,
      },
      {
        label: 'Products',
        to: '/admin/products',
        end: false,
        icon: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />,
      },
      {
        label: 'Category',
        to: '/admin/categories',
        end: false,
        icon: <CategoryOutlinedIcon sx={{ fontSize: 18 }} />,
      },
      {
        label: 'Attributes',
        to: '/admin/category-attributes',
        end: false,
        icon: <TuneRoundedIcon sx={{ fontSize: 18 }} />,
      },
      {
        label: 'Order',
        to: '/admin/orders',
        end: false,
        icon: <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />,
      },
    ],
    [],
  );

  const sidebarWidth = collapsed ? 84 : 260;
  const showLabels = !collapsed;

  const SidebarContent = ({
    compact,
    onNavigate,
  }: {
    compact: boolean;
    onNavigate?: () => void;
  }) => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ color: 'rgba(107,114,128,0.9)', mb: compact ? 1 : 1.5, px: compact ? 0.5 : 0 }}
      >
        {!compact ? 'MANAGEMENT' : 'M'}
      </Typography>

      <Stack
        spacing={0.75}
        sx={{
          px: compact ? 0.5 : 0,
          '& a': { transition: 'all 160ms ease' },
          '& a:hover': {
            backgroundColor: 'rgba(15,23,42,0.06)',
            transform: 'translateX(1px)',
          },
        }}
      >
        {navItems.map((item) => (
          <Box key={item.to} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: compact ? 0 : 10,
                justifyContent: compact ? 'center' : 'flex-start',
                padding: compact ? '10px 8px' : '10px 12px',
                borderRadius: 12,
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: 650,
                backgroundColor: isActive ? 'rgba(16,185,129,0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(16,185,129,0.35)' : '1px solid transparent',
                whiteSpace: 'nowrap',
              })}
            >
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(71,85,105,0.95)',
                }}
              >
                {item.icon}
              </Box>
              {!compact ? item.label : null}
            </NavLink>
          </Box>
        ))}
      </Stack>

      <Box sx={{ flex: 1 }} />
      <Divider sx={{ my: 2, borderColor: 'rgba(229, 231, 235, 1)' }} />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ px: 0, display: compact ? 'none' : 'block' }}
      >
        Admin console for products, orders, categories & catalog attributes.
      </Typography>
    </Box>
  );

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box
        bgcolor="#F6F7FB"
        color="#0F172A"
        minHeight="100vh"
        display="flex"
        flexDirection="column"
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            borderBottom: '1px solid rgba(229, 231, 235, 1)',
            backgroundImage: 'none',
          }}
        >
          <Toolbar>
            {!mdUp ? (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1.5, color: 'inherit' }}>
                <MenuRoundedIcon />
              </IconButton>
            ) : null}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ flexGrow: 1, minWidth: 0 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
                ShopSphere Admin
              </Typography>
              <Chip
                label="Free"
                size="small"
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: 'rgba(15,23,42,0.06)',
                  border: '1px solid rgba(15,23,42,0.08)',
                }}
              />
            </Stack>

            {mdUp ? (
              <Box
                sx={{
                  mr: 1.5,
                  minWidth: 220,
                  maxWidth: 340,
                  width: '28%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 2,
                  border: '1px solid rgba(229, 231, 235, 1)',
                  bgcolor: '#F8FAFC',
                }}
              >
                <SearchRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <InputBase
                  placeholder="Search anything..."
                  sx={{ flex: 1, fontSize: 14 }}
                  inputProps={{ 'aria-label': 'Command search' }}
                />
                <Chip
                  label="⌘K"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    bgcolor: '#FFFFFF',
                    border: '1px solid rgba(209,213,219,1)',
                  }}
                />
              </Box>
            ) : null}

            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mr: 1 }}>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <SearchRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <LanguageRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={4} color="error" overlap="circular">
                  <NotificationsNoneRoundedIcon fontSize="small" />
                </Badge>
              </IconButton>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <SettingsRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <HelpOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              AD
            </Avatar>

            <MuiLink
              href="/"
              underline="none"
              color="inherit"
              sx={{ fontWeight: 600, ml: 1, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Store
            </MuiLink>
            {mdUp ? (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setCollapsed((v) => !v)}
                sx={{
                  color: '#0F172A',
                  borderColor: 'rgba(148, 163, 184, 0.9)',
                  bgcolor: '#FFFFFF',
                  fontWeight: 700,
                  mr: 1,
                  '&:hover': {
                    borderColor: '#64748B',
                    bgcolor: 'rgba(148, 163, 184, 0.08)',
                  },
                }}
              >
                {collapsed ? 'Expand' : 'Collapse'}
              </Button>
            ) : null}
          </Toolbar>
        </AppBar>

        <Box
          flex="1 1 auto"
          minHeight={0}
          display="flex"
          sx={{
            overflow: 'hidden',
          }}
        >
          {mdUp ? (
            <Box
              component="aside"
              sx={{
                flex: '0 0 auto',
                width: collapsed ? sidebarWidth : { md: '32%', lg: '24%', xl: '20%' },
                minWidth: collapsed ? sidebarWidth : 240,
                maxWidth: collapsed ? sidebarWidth : 340,
                boxSizing: 'border-box',
                borderRight: '1px solid rgba(229, 231, 235, 1)',
                bgcolor: '#FFFFFF',
                p: 2,
                overflow: 'auto',
              }}
            >
              <SidebarContent compact={!showLabels} />
            </Box>
          ) : (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              PaperProps={{
                sx: {
                  width: 260,
                  boxSizing: 'border-box',
                  bgcolor: '#FFFFFF',
                  p: 2,
                },
              }}
            >
              <SidebarContent compact={false} onNavigate={() => setMobileOpen(false)} />
            </Drawer>
          )}

          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: 'auto',
              p: { xs: 2, md: 3 },
              backgroundColor: '#F6F7FB',
            }}
          >
            <Box
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                border: '1px solid rgba(229, 231, 235, 1)',
                p: { xs: 1.5, md: 3 },
                minHeight: 'calc(100vh - 160px)',
              }}
            >
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

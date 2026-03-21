import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import {
  AppBar,
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  Container,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { CategoryMenu } from '../CategoryMenu';
import { categories } from '../CategoryMenu/categoryData';

type HeaderProps = {
  showCategories?: boolean;
};

export const Header = ({ showCategories = true }: HeaderProps) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openSubcategory, setOpenSubcategory] = useState<string | null>(null);

  const resetDrawerNavigation = () => {
    setDrawerOpen(false);
    setOpenCategory(null);
    setOpenSubcategory(null);
  };

  const drawerCategories = useMemo(() => (showCategories ? categories : []), [showCategories]);

  const openDrawer = () => {
    setDrawerOpen(true);
    setOpenCategory(null);
    setOpenSubcategory(null);
  };

  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: (theme) => theme.zIndex.appBar }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: primary }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 60, md: 64 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              {showCategories ? (
                <IconButton
                  size="large"
                  onClick={openDrawer}
                  sx={{ color: '#fff', display: { xs: 'inline-flex', sm: 'none' } }}
                  aria-label="open navigation menu"
                >
                  <MenuIcon />
                </IconButton>
              ) : null}

              <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <Typography
                  component={RouterLink}
                  to="/"
                  variant="h6"
                  fontWeight={800}
                  sx={{ color: '#fff', textDecoration: 'none', letterSpacing: 0.2 }}
                >
                  ShopSphere
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', mt: -0.5 }}>
                  Explore Plus
                </Typography>
              </Box>
            </Box>

            <Paper
              elevation={0}
              sx={{
                flex: 1,
                alignItems: 'center',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                maxWidth: { sm: 560, md: 640 },
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              <InputBase
                placeholder="Search for products, brands and more"
                sx={{ ml: 1, flex: 1, fontSize: 14 }}
                inputProps={{ 'aria-label': 'search' }}
              />
              <IconButton size="small" sx={{ color: primary }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>

            <Box
              sx={{
                ml: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <IconButton
                onClick={openDrawer}
                sx={{
                  color: '#fff',
                  display: { xs: 'inline-flex', sm: 'none' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                }}
                aria-label="open search"
              >
                <SearchIcon />
              </IconButton>

              <IconButton
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#fff',
                  display: { xs: 'inline-flex', sm: 'none' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                }}
                aria-label="login"
              >
                <AccountCircleOutlinedIcon />
              </IconButton>

              <IconButton
                component={RouterLink}
                to="/cart"
                sx={{
                  color: '#fff',
                  display: { xs: 'inline-flex', sm: 'none' },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                }}
                aria-label="cart"
              >
                <ShoppingCartOutlinedIcon />
              </IconButton>

              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                disableElevation
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  bgcolor: '#fff',
                  color: primary,
                  fontWeight: 700,
                  px: 3,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
                }}
              >
                Login
              </Button>

              <Button
                component={RouterLink}
                to="/cart"
                startIcon={<ShoppingCartOutlinedIcon />}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  color: '#fff',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                Cart
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {showCategories ? (
        <Box
          sx={{
            display: { xs: 'none', sm: 'block' },
            bgcolor: '#fff',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="lg" sx={{ py: 1 }}>
            <CategoryMenu variant="light" />
          </Container>
        </Box>
      ) : null}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={resetDrawerNavigation}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 360,
            maxWidth: '90vw',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <Typography
                component={RouterLink}
                to="/"
                variant="h6"
                fontWeight={800}
                sx={{ color: 'text.primary', textDecoration: 'none', letterSpacing: 0.2 }}
              >
                ShopSphere
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: -0.5 }}>
                Explore Plus
              </Typography>
            </Box>

            <IconButton onClick={resetDrawerNavigation} aria-label="close navigation menu">
              <CloseIcon />
            </IconButton>
          </Box>

          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              mb: 2,
            }}
          >
            <InputBase
              placeholder="Search for products..."
              sx={{ ml: 1, flex: 1, fontSize: 14 }}
              inputProps={{ 'aria-label': 'mobile search' }}
            />
            <IconButton size="small" sx={{ color: primary }} aria-label="mobile search">
              <SearchIcon />
            </IconButton>
          </Paper>

          <Divider sx={{ my: 2 }} />

          <List disablePadding>
            {drawerCategories.map((cat) => {
              const catKey = cat.label;
              const catOpen = openCategory === catKey;

              return (
                <Box key={catKey}>
                  <ListItemButton
                    onClick={() => {
                      setOpenCategory(catOpen ? null : catKey);
                      setOpenSubcategory(null);
                    }}
                    sx={{ px: 2, py: 1 }}
                  >
                    <ListItemText
                      primary={cat.label}
                      primaryTypographyProps={{ fontWeight: 700 }}
                    />
                    {catOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>

                  <Collapse in={catOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 2 }}>
                      {cat.children.map((sub) => {
                        const subKey = `${catKey}|${sub.label}`;
                        const subOpen = openSubcategory === subKey;

                        return (
                          <Box key={subKey}>
                            <ListItemButton
                              onClick={() => setOpenSubcategory(subOpen ? null : subKey)}
                              sx={{ px: 2, py: 0.75 }}
                            >
                              <ListItemText
                                primary={sub.label}
                                primaryTypographyProps={{ fontWeight: 650 }}
                              />
                              {subOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItemButton>

                            <Collapse in={subOpen} timeout="auto" unmountOnExit>
                              <List disablePadding>
                                {sub.children.map((item) => (
                                  <ListItemButton
                                    key={item.to}
                                    component={RouterLink}
                                    to={item.to}
                                    onClick={resetDrawerNavigation}
                                    sx={{ px: 2, py: 0.75, pl: 4 }}
                                  >
                                    <ListItemText primary={item.label} />
                                  </ListItemButton>
                                ))}
                              </List>
                            </Collapse>
                          </Box>
                        );
                      })}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </List>

          <Divider sx={{ my: 2 }} />

          <List disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/login"
              onClick={resetDrawerNavigation}
              sx={{ px: 2, py: 1 }}
            >
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/cart"
              onClick={resetDrawerNavigation}
              sx={{ px: 2, py: 1 }}
            >
              <ListItemText primary="Cart" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

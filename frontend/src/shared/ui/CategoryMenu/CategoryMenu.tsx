import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Button, Divider, Menu, Link as MuiLink, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import {
  fetchActiveCategoryTree,
  type BackendCategoryTreeNode,
} from '../../lib/categoryTreeClient';

type MenuVariant = 'light' | 'dark';

type CategoryMenuProps = {
  variant?: MenuVariant;
};

export const CategoryMenu = ({ variant = 'light' }: CategoryMenuProps) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);
  const [activeRoot, setActiveRoot] = useState<BackendCategoryTreeNode | null>(null);
  const [tree, setTree] = useState<BackendCategoryTreeNode[] | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchActiveCategoryTree()
      .then((data) => {
        if (!mounted) return;
        setTree(data);
      })
      .catch(() => {
        if (!mounted) return;
        setTree([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const roots = tree ?? [];

  const openCategoryMenu = (
    event: React.MouseEvent<HTMLElement>,
    root: BackendCategoryTreeNode,
  ) => {
    setActiveRoot(root);
    setCategoryAnchor(event.currentTarget);
  };

  const closeAll = () => {
    setCategoryAnchor(null);
    setActiveRoot(null);
  };

  const rootChildren = useMemo(() => activeRoot?.children ?? [], [activeRoot]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'nowrap',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflowX: 'auto',
          px: 0,
          py: 0,
          border: 'none',
          borderRadius: 0,
          bgcolor: 'transparent',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {roots.map((cat) => (
          <Button
            key={cat._id}
            variant="text"
            endIcon={<KeyboardArrowDownIcon fontSize="small" />}
            onClick={(e) => openCategoryMenu(e, cat)}
            aria-haspopup="menu"
            aria-expanded={Boolean(categoryAnchor) && activeRoot?._id === cat._id}
            sx={
              variant === 'dark'
                ? {
                    color: '#F8FAFC',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 2,
                    py: 0.75,
                    borderRadius: 999,
                    fontSize: 13,
                    minHeight: 36,
                    '&:hover': { bgcolor: 'rgba(248,250,252,0.10)' },
                  }
                : {
                    color: 'rgba(17,24,39,0.92)',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 2,
                    py: 0.75,
                    borderRadius: 999,
                    fontSize: 13,
                    minHeight: 36,
                    '&:hover': { bgcolor: 'rgba(26,115,232,0.10)', color: primary },
                  }
            }
          >
            {cat.name}
          </Button>
        ))}
      </Box>

      <Menu
        anchorEl={categoryAnchor}
        open={Boolean(categoryAnchor)}
        onClose={closeAll}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        MenuListProps={{ dense: true }}
        slotProps={{
          paper: {
            sx: { borderRadius: 2, mt: 1, overflow: 'hidden' },
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            minWidth: 680,
            maxWidth: 920,
            bgcolor: 'background.paper',
            border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0px 14px 40px rgba(15,23,42,0.18)',
          }}
        >
          <Box sx={{ px: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>
              {activeRoot?.name ?? ''}
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          {rootChildren.length ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(210px, 1fr))',
                  md: 'repeat(3, minmax(220px, 1fr))',
                },
                gap: 2,
                maxHeight: 420,
                overflow: 'auto',
                pr: 1,
              }}
            >
              {rootChildren.map((l2) => {
                const l3 = l2.children ?? [];
                return (
                  <Box key={l2._id}>
                    <Typography
                      fontWeight={900}
                      sx={{
                        fontSize: 13,
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      {l2.name}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      {(l3.length ? l3 : [l2]).map((leaf) => (
                        <MuiLink
                          key={leaf._id}
                          component={RouterLink}
                          to={`/category/${leaf.slug}`}
                          underline="none"
                          onClick={closeAll}
                          sx={{
                            fontSize: 13,
                            color: 'text.secondary',
                            py: 0.25,
                            '&:hover': { color: primary, textDecoration: 'underline' },
                          }}
                        >
                          {leaf.name}
                        </MuiLink>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ p: 1 }}>
              No categories available.
            </Typography>
          )}
        </Box>
      </Menu>
    </>
  );
};

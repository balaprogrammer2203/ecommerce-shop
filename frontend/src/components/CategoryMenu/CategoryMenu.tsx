import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { categories } from './categoryData';

type MenuVariant = 'light' | 'dark';

type CategoryMenuProps = {
  variant?: MenuVariant;
};

export const CategoryMenu = ({ variant = 'light' }: CategoryMenuProps) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);
  const [subcategoryAnchor, setSubcategoryAnchor] = useState<null | HTMLElement>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [activeSubcategoryIndex, setActiveSubcategoryIndex] = useState<number | null>(null);

  const openCategoryMenu = (event: React.MouseEvent<HTMLElement>, idx: number) => {
    setActiveCategoryIndex(idx);
    setActiveSubcategoryIndex(null);
    setCategoryAnchor(event.currentTarget);
    setSubcategoryAnchor(null);
  };

  const closeAll = () => {
    setCategoryAnchor(null);
    setSubcategoryAnchor(null);
    setActiveCategoryIndex(null);
    setActiveSubcategoryIndex(null);
  };

  const activeCategory = activeCategoryIndex != null ? categories[activeCategoryIndex] : null;
  const activeSubcategory =
    activeCategory && activeSubcategoryIndex != null
      ? activeCategory.children[activeSubcategoryIndex]
      : null;

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
        {categories.map((cat, idx) => (
          <Button
            key={cat.label}
            variant="text"
            endIcon={<KeyboardArrowDownIcon fontSize="small" />}
            onClick={(e) => openCategoryMenu(e, idx)}
            aria-haspopup="menu"
            aria-expanded={Boolean(categoryAnchor) && activeCategoryIndex === idx}
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
            {cat.label}
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
            sx: {
              minWidth: 240,
              borderRadius: 2,
              border: '1px solid rgba(15,23,42,0.08)',
              boxShadow: '0px 14px 40px rgba(15,23,42,0.18)',
              mt: 1,
            },
          },
        }}
      >
        {activeCategory?.children.map((sub, subIdx) => (
          <MenuItem
            key={sub.label}
            onClick={(e) => {
              setActiveSubcategoryIndex(subIdx);
              setSubcategoryAnchor(e.currentTarget);
            }}
            aria-haspopup="menu"
            sx={{
              fontWeight: 650,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              borderRadius: 1,
              mx: 0.75,
              '&:hover': { bgcolor: 'rgba(26,115,232,0.10)' },
            }}
          >
            <Box component="span" sx={{ flex: 1 }}>
              {sub.label}
            </Box>
            <ChevronRightIcon fontSize="small" />
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={subcategoryAnchor}
        open={Boolean(subcategoryAnchor)}
        onClose={closeAll}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        MenuListProps={{ dense: true }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 260,
              borderRadius: 2,
              border: '1px solid rgba(15,23,42,0.08)',
              boxShadow: '0px 14px 40px rgba(15,23,42,0.18)',
            },
          },
        }}
      >
        {activeSubcategory?.children.map((item) => (
          <MenuItem
            key={item.to}
            component={RouterLink}
            to={item.to}
            onClick={closeAll}
            sx={{
              fontWeight: 650,
              borderRadius: 1,
              mx: 0.75,
              '&:hover': { bgcolor: 'rgba(26,115,232,0.10)' },
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

import { Card, CardActions, CardContent, CardMedia, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import type { Product } from '../../features/catalog/types';

type ProductCardProps = {
  product: Product;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #EDF2F7' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.image || 'https://placehold.co/400x300/CCCCCC/666666?text=Product'}
        alt={product.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" fontWeight={600}>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>
        <Typography variant="h6" mt={2}>
          ${product.price.toFixed(2)}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button component={RouterLink} to={`/product/${product._id}`} variant="contained" fullWidth>
          View
        </Button>
      </CardActions>
    </Card>
  );
};

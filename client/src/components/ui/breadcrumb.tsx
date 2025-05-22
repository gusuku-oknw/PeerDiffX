import { Box, Breadcrumbs, Typography, Link } from '@mui/material';
import { FaChevronRight } from 'react-icons/fa';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <Box sx={{ mb: 2, py: 1 }}>
      <Breadcrumbs
        separator={<FaChevronRight className="text-gray-400 text-xs" />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            mx: 1
          }
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          if (isLast || !item.href) {
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontWeight: isLast ? 600 : 400,
                  color: isLast ? 'text.primary' : 'text.secondary',
                  fontSize: '0.875rem'
                }}
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              underline="hover"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 400,
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
import React, { forwardRef } from 'react';
import { Tabs as MuiTabs, Tab as MuiTab, Box } from '@mui/material';

interface TabsProps {
  value: string | number;
  onValueChange: (event: React.SyntheticEvent, newValue: string | number) => void;
  children: React.ReactNode;
  className?: string;
}
export const Tabs = ({ value, onValueChange, children, className, ...props }: TabsProps) => {
  return (
    <MuiTabs
      value={value}
      onChange={onValueChange}
      className={className}
      {...props}
    >
      {children}
    </MuiTabs>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, ...props }, ref) => (
    <Box
      ref={ref}
      display="flex"
      alignItems="center"
      className={className}
      {...props}
    >
      {children}
    </Box>
  )
);
TabsList.displayName = 'TabsList';

interface TabsTriggerProps {
  value: string | number;
  children: React.ReactNode;
  className?: string;
}
export const TabsTrigger = forwardRef<HTMLElement, TabsTriggerProps>(
  ({ value, children, className, ...props }, ref) => (
    <MuiTab
      ref={ref}
      value={value}
      label={children}
      className={className}
      {...props}
    />
  )
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps {
  value: string | number;
  index: string | number;
  children: React.ReactNode;
  className?: string;
}
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, index, children, className, ...props }, ref) => (
    <div
      ref={ref}
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className={className}
      {...props}
    >
      {value === index && <Box p={2}>{children}</Box>}
    </div>
  )
);
TabsContent.displayName = 'TabsContent';

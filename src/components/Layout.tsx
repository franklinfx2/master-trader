import { ResponsiveLayout } from './ResponsiveLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
};
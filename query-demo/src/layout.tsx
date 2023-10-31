import StyledJsxRegistry from './styles/registry';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StyledJsxRegistry>{children}</StyledJsxRegistry>;
}

import "./globals.css";

export const metadata = {
  title: "Jira Kanban - Web Socket",
  description:
    "Interface interativa de Kanban inspirada no Jira, com atualização em tempo real via WebSocket.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

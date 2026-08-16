import "./globals.css";

export const metadata = {
  title: "AquaFix Plumbing — Same-Day Plumbing Repairs",
  description:
    "Licensed plumbing service in Metro Ridge with an AI support assistant that knows our pricing, hours, and policies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

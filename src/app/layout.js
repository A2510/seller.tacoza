import { Inter } from "next/font/google";
import "./globals.css";
import Subscribe from "./subscribe";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  manifest: "/pwa/manifest.json",
  title: "Tacoza Seller",
  description: "Generated by create next app",
};

export const Viewport = {
  themeColor: "#e21e47",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Subscribe />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import "./enhancements.css";
export const metadata: Metadata = { title: "Dangote Refinery IPO Investment Calculator", description: "Estimate eligible Dangote Refinery IPO shares and application cash from the published offer price, your fee inputs, and your own selling-price assumption." };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en-NG"><body>{children}</body></html>; }

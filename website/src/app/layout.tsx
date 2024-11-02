import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import LoginPage from "./(auth)/login/page";
import SideBar from "@/components/Navigation/Sidebar";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
    title: "Mindforge",
    description: "Generated by create next app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body
                className={`min-h-screen antialiased bg-myslate-950 text-white`}
            >
                <Toaster position="bottom-right" />
                {children}
            </body>
        </html>
    );
}

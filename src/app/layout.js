import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import { Suspense } from "react";

export const metadata = {
  title: "Report AIder",
  description: "Aid in generating reports with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="bg-base-200 flex">
        <div className="container mx-auto">
          <AppProvider>
            <SessionWrapper>
              <Suspense fallback={<div>Loading...</div>}>
                <Header />
                {children}
              </Suspense>
            </SessionWrapper>
          </AppProvider>
        </div>
      </body>
    </html>
  );
}

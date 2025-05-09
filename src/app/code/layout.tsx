import "@livekit/components-styles";
import { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Insert code",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="h-full">{children}</div>
  );
}

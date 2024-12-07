import { Inter } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/ui/dashboard/header";
import { Sidebar } from "@/components/ui/dashboard/sidebar";
import ErrorComponent from "@/components/ErrorComponent";
import { Toaster } from "@/components/ui/toaster";
import { OrderProvider } from "@/context/OrderContext";
import { NewOrder } from "./newOrder";
// server actions
import { getOutlet } from "@/app/features/restaurant/server/actions/getOutlet";

const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "Tacoza Seller",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }) {
  const [error, outlet] = await getOutlet();
  if (error) return <ErrorComponent error={error} />;
  
  return (
    <OrderProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="flex flex-col max-h-screen overflow-hidden">
          <Header outlet={outlet}/>
          {children}
          <Toaster />
        </div>
      </div>
      <NewOrder />
    </OrderProvider>
  );
}

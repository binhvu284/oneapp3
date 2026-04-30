import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Wallet, ArrowRightLeft, TrendingUp, Bell } from "lucide-react";
import { BackNavigation } from "@/components/navigation/BackNavigation";
import { CryptoOverview } from "@/components/crypto/CryptoOverview";
import { CryptoPortfolio } from "@/components/crypto/CryptoPortfolio";
import { CryptoTransactions } from "@/components/crypto/CryptoTransactions";
import { CryptoMarket } from "@/components/crypto/CryptoMarket";
import { WatchlistTab } from "@/components/crypto/WatchlistTab";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useCryptoPortfolio } from "@/hooks/useCryptoPortfolio";
import { useCryptoTransactions } from "@/hooks/useCryptoTransactions";

export default function OneCrypto() {
  const [activeTab, setActiveTab] = useState("overview");
  const { prices, isLoading: pricesLoading } = useCryptoPrices();
  const { holdings, isLoading: holdingsLoading, deleteHolding } = useCryptoPortfolio();
  const { transactions, isLoading: txLoading, addTransaction, deleteTransaction } = useCryptoTransactions();

  const isLoading = pricesLoading || holdingsLoading || txLoading;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        
        
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-6">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 gap-2">

            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="portfolio"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 gap-2">

            <Wallet className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 gap-2">

            <ArrowRightLeft className="w-4 h-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="market"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 gap-2">

            <TrendingUp className="w-4 h-4" />
            Market
          </TabsTrigger>
          <TabsTrigger
            value="watchlist"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-1 gap-2">

            <Bell className="w-4 h-4" />
            Watchlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <CryptoOverview holdings={holdings} transactions={transactions} prices={prices} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="portfolio" className="mt-4">
          <CryptoPortfolio holdings={holdings} prices={prices} isLoading={holdingsLoading} onDelete={deleteHolding} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <CryptoTransactions transactions={transactions} isLoading={txLoading} onAdd={addTransaction} onDelete={deleteTransaction} />
        </TabsContent>

        <TabsContent value="market" className="mt-4">
          <CryptoMarket />
        </TabsContent>

        <TabsContent value="watchlist" className="mt-4">
          <WatchlistTab prices={prices} pricesLoading={pricesLoading} />
        </TabsContent>
      </Tabs>
    </div>);

}
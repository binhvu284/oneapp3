import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { CryptoTransaction, CreateTransactionData } from "@/hooks/useCryptoTransactions";

interface CryptoTransactionsProps {
  transactions: CryptoTransaction[];
  isLoading: boolean;
  onAdd: (data: CreateTransactionData) => Promise<any>;
  onDelete: (id: string) => void;
}

export function CryptoTransactions({ transactions, isLoading, onAdd, onDelete }: CryptoTransactionsProps) {
  if (isLoading) {
    return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Transaction History</h3>
        <AddTransactionDialog onAdd={onAdd} />
      </div>

      {transactions.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No transactions yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Click "Add Transaction" to record your first trade.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {transactions.map(tx => {
            const date = new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <Card key={tx.id} className="border-border hover:bg-card-hover transition-colors">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      tx.transaction_type === 'buy' ? 'bg-green-500/10 text-green-500' :
                      tx.transaction_type === 'sell' ? 'bg-destructive/10 text-destructive' :
                      tx.transaction_type === 'transfer' ? 'bg-primary/10 text-primary' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {tx.transaction_type.toUpperCase()}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{tx.coin_symbol.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">{date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm">{tx.quantity} × ${tx.price_per_unit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="text-xs font-medium text-muted-foreground">${tx.total_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(tx.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

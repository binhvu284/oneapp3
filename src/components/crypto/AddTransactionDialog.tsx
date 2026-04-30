import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { CreateTransactionData } from "@/hooks/useCryptoTransactions";

interface AddTransactionDialogProps {
  onAdd: (data: CreateTransactionData) => Promise<any>;
}

export function AddTransactionDialog({ onAdd }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    coin_symbol: '',
    transaction_type: 'buy' as const,
    quantity: '',
    price_per_unit: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coin_symbol || !form.quantity || !form.price_per_unit) return;

    setIsSubmitting(true);
    const qty = parseFloat(form.quantity);
    const price = parseFloat(form.price_per_unit);
    
    await onAdd({
      coin_symbol: form.coin_symbol.toUpperCase(),
      transaction_type: form.transaction_type,
      quantity: qty,
      price_per_unit: price,
      total_value: qty * price,
      notes: form.notes || undefined,
    });
    
    setForm({ coin_symbol: '', transaction_type: 'buy', quantity: '', price_per_unit: '', notes: '' });
    setIsSubmitting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Coin Symbol</Label>
              <Input
                placeholder="BTC"
                value={form.coin_symbol}
                onChange={e => setForm(f => ({ ...f, coin_symbol: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={form.transaction_type} onValueChange={(v: any) => setForm(f => ({ ...f, transaction_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="receive">Receive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Quantity</Label>
              <Input type="number" step="any" placeholder="0.5" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Price (USD)</Label>
              <Input type="number" step="any" placeholder="65000" value={form.price_per_unit} onChange={e => setForm(f => ({ ...f, price_per_unit: e.target.value }))} required />
            </div>
          </div>
          {form.quantity && form.price_per_unit && (
            <div className="text-sm text-muted-foreground">
              Total: <span className="text-foreground font-medium">${(parseFloat(form.quantity) * parseFloat(form.price_per_unit)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Notes (optional)</Label>
            <Input placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Transaction'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, QrCode, CreditCard } from "lucide-react";
import {
  getDebitBanks,
  getAllDebitBanks,
  createDebitBank,
  updateDebitBank,
  deleteDebitBank,
  getActiveQris,
  getAllQris,
  createQris,
  updateQris,
  deleteQris,
} from "@/actions/payment-methods";

interface DebitBank {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
  displayOrder: number;
}

interface QrisCode {
  id: string;
  qrisData: string;
  merchantName: string;
  displayText: string;
  isActive: boolean;
}

export function PaymentMethodsContent() {
  const [banks, setBanks] = useState<DebitBank[]>([]);
  const [qrisList, setQrisList] = useState<QrisCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [isAddingQris, setIsAddingQris] = useState(false);

  // Form states
  const [bankForm, setBankForm] = useState({ bankName: "", accountNumber: "", accountHolder: "" });
  const [qrisForm, setQrisForm] = useState({ qrisData: "", merchantName: "", displayText: "Scan QRIS" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [banksData, qrisData] = await Promise.all([getAllDebitBanks(), getAllQris()]);
      setBanks(banksData);
      setQrisList(qrisData);
    } catch (error) {
      toast.error("Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBank = async () => {
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountHolder) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createDebitBank(bankForm);
      toast.success("Debit bank added successfully");
      setBankForm({ bankName: "", accountNumber: "", accountHolder: "" });
      loadData();
    } catch (error) {
      toast.error("Failed to add debit bank");
    }
  };

  const handleUpdateBank = async (id: string, data: Partial<DebitBank>) => {
    try {
      await updateDebitBank(id, data);
      toast.success("Debit bank updated");
      loadData();
    } catch (error) {
      toast.error("Failed to update debit bank");
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDebitBank(id);
      toast.success("Debit bank deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete debit bank");
    }
  };

  const handleAddQris = async () => {
    if (!qrisForm.qrisData || !qrisForm.merchantName) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createQris(qrisForm);
      toast.success("QRIS added successfully");
      setQrisForm({ qrisData: "", merchantName: "", displayText: "Scan QRIS" });
      loadData();
    } catch (error) {
      toast.error("Failed to add QRIS");
    }
  };

  const handleDeleteQris = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteQris(id);
      toast.success("QRIS deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete QRIS");
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
        <p className="text-muted-foreground">
          Configure debit banks and QRIS for your customers
        </p>
      </div>

      <Tabs defaultValue="debit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="debit" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Debit Banks
          </TabsTrigger>
          <TabsTrigger value="qris" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QRIS
          </TabsTrigger>
        </TabsList>

        {/* Debit Banks Tab */}
        <TabsContent value="debit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Debit Banks</CardTitle>
                  <CardDescription>
                    Add debit bank information for customers
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Bank
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Debit Bank</DialogTitle>
                      <DialogDescription>
                        Add a new debit bank account for customers to use
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          placeholder="e.g., BCA, BNI, Mandiri"
                          value={bankForm.bankName}
                          onChange={(e) =>
                            setBankForm({ ...bankForm, bankName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          placeholder="e.g., 1234567890"
                          value={bankForm.accountNumber}
                          onChange={(e) =>
                            setBankForm({
                              ...bankForm,
                              accountNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountHolder">Account Holder Name</Label>
                        <Input
                          id="accountHolder"
                          placeholder="e.g., John Doe / PT Company"
                          value={bankForm.accountHolder}
                          onChange={(e) =>
                            setBankForm({
                              ...bankForm,
                              accountHolder: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button onClick={handleAddBank} className="w-full">
                        Add Bank
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {banks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No debit banks configured yet
                </div>
              ) : (
                <div className="space-y-3">
                  {banks.map((bank) => (
                    <div
                      key={bank.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{bank.bankName}</p>
                        <p className="text-sm text-muted-foreground">
                          {bank.accountNumber} • {bank.accountHolder}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={bank.isActive}
                          onCheckedChange={(checked) =>
                            handleUpdateBank(bank.id, { isActive: checked })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteBank(bank.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* QRIS Tab */}
        <TabsContent value="qris" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>QRIS Configuration</CardTitle>
                  <CardDescription>
                    Add QRIS code for customers to scan
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add QRIS
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add QRIS Code</DialogTitle>
                      <DialogDescription>
                        Add a new QRIS code for customers to scan and pay
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="merchantName">Merchant Name</Label>
                        <Input
                          id="merchantName"
                          placeholder="Your store name"
                          value={qrisForm.merchantName}
                          onChange={(e) =>
                            setQrisForm({
                              ...qrisForm,
                              merchantName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="qrisData">QRIS Data / URL</Label>
                        <Input
                          id="qrisData"
                          placeholder="Paste QRIS code or image URL"
                          value={qrisForm.qrisData}
                          onChange={(e) =>
                            setQrisForm({ ...qrisForm, qrisData: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="displayText">Display Text</Label>
                        <Input
                          id="displayText"
                          placeholder="e.g., Scan QRIS"
                          value={qrisForm.displayText}
                          onChange={(e) =>
                            setQrisForm({
                              ...qrisForm,
                              displayText: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button onClick={handleAddQris} className="w-full">
                        Add QRIS
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {qrisList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No QRIS codes configured yet
                </div>
              ) : (
                <div className="space-y-3">
                  {qrisList.map((qris) => (
                    <div
                      key={qris.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{qris.merchantName}</p>
                        <p className="text-sm text-muted-foreground">
                          {qris.displayText}
                        </p>
                        {qris.isActive && (
                          <span className="text-xs bg-green-500/10 text-green-700 px-2 py-1 rounded mt-1 inline-block">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteQris(qris.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

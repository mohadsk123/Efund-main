import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataApi } from "@/hooks/use-data-api";
import { LayoutDashboard, PlusCircle, Loader2 } from "lucide-react";

const AdminSchemes = () => {
  const { createScheme, schemes, isLoadingSchemes } = useDataApi();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    maxIncome: "",
    minAge: "",
    maxAge: "",
    gender: "0"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createScheme(formData);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <LayoutDashboard className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Admin: Scheme Management</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" /> Create New Scheme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Scheme Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. PM Kisan" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (ETH)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Income (ETH)</Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    value={formData.maxIncome} 
                    onChange={e => setFormData({...formData, maxIncome: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Age</Label>
                  <Input 
                    type="number" 
                    value={formData.minAge} 
                    onChange={e => setFormData({...formData, minAge: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Age</Label>
                  <Input 
                    type="number" 
                    value={formData.maxAge} 
                    onChange={e => setFormData({...formData, maxAge: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gender Requirement</Label>
                <Select onValueChange={v => setFormData({...formData, gender: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All</SelectItem>
                    <SelectItem value="1">Male Only</SelectItem>
                    <SelectItem value="2">Female Only</SelectItem>
                    <SelectItem value="3">Other Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Scheme to Blockchain"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle>Active Schemes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingSchemes ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                schemes.map(s => (
                  <div key={s.id} className="p-4 border rounded-md bg-muted/50">
                    <h3 className="font-bold text-lg">{s.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Budget: {s.budget} ETH | Per Person: {s.amount} ETH
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Age: {s.minAge}-{s.maxAge}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Income {"<"} {s.maxIncome} ETH
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSchemes;
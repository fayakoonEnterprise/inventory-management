
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/supabaseClient';
import { PageHeader } from '@/components/page-header';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import type { Database } from '@/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Settings = Database['public']['Tables']['settings']['Row'];
type NewSettings = Database['public']['Tables']['settings']['Insert'];


function SettingsSkeleton() {
    return (
        <>
            <PageHeader
                title="Settings"
                description="Configure your shop, manage currency, tax, and data."
            />
            <Skeleton className="h-10 w-full mb-4" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-28" />
                </CardFooter>
            </Card>
        </>
    )
}

const defaultSettings: NewSettings = {
    shop_name: 'My Shop',
    address: '123 Main Street',
    logo_url: 'https://picsum.photos/seed/shopstocklogo/100/100',
    currency: 'PKR',
    include_tax: false
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | NewSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        console.error('Error fetching settings:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch settings.' });
        setSettings(null);
      } else if (!data) {
        setSettings(defaultSettings);
      }
      else {
        setSettings(data);
      }
      setLoading(false);
    }
    fetchSettings();
  }, [toast]);

  const handleSettingChange = (key: keyof Settings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSave = async (section: string) => {
    if (!settings) return;

    const settingsData = {
        shop_name: settings.shop_name,
        address: settings.address,
        logo_url: settings.logo_url,
        currency: settings.currency,
        include_tax: settings.include_tax
    };

    let error;
    let successMessage = '';

    if ('id' in settings && settings.id) {
        // Update existing settings
        ({ error } = await supabase
            .from('settings')
            .update(settingsData)
            .eq('id', settings.id));
        successMessage = `Your ${section.toLowerCase()} settings have been saved.`
    } else {
        // Insert new settings
        const { data: newSettings, error: insertError } = await supabase
            .from('settings')
            .insert(settingsData)
            .select()
            .single();
        
        error = insertError;
        if (!error && newSettings) {
            setSettings(newSettings); // update state with the newly created settings object (including ID)
            successMessage = `Your shop settings have been created.`
        }
    }


    if (error) {
        toast({ variant: 'destructive', title: `Error saving ${section}`, description: error.message });
    } else {
        toast({ title: `${section} Updated`, description: successMessage});
    }
  }

  if (loading) {
    return <SettingsSkeleton />;
  }
  
  if (!settings) {
    // This will now only show if there's a persistent error, not just no settings
    return (
      <div className="flex items-center justify-center h-full">
        <p>Could not load settings. Please try again later.</p>
      </div>
    );
  }


  return (
    <>
      <PageHeader
        title="Settings"
        description="Configure your shop, manage currency, tax, and data."
      />

      <Tabs defaultValue="shop" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shop">Shop Info</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="backup">Backup/Export</TabsTrigger>
        </TabsList>
        <TabsContent value="shop">
          <Card>
            <CardHeader>
              <CardTitle>Shop Information</CardTitle>
              <CardDescription>Update your shop's public details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Image src={settings.logo_url || 'https://picsum.photos/seed/shopstocklogo/100/100'} alt="Shop Logo" width={80} height={80} className="rounded-full" data-ai-hint="logo abstract" />
                <Button variant="outline">Change Logo</Button>
              </div>
              <div className="space-y-1">
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input id="shop-name" value={settings.shop_name} onChange={(e) => handleSettingChange('shop_name', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={settings.address || ''} onChange={(e) => handleSettingChange('address', e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('Shop Info')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>Choose the currency for your shop.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency?.toLowerCase()} onValueChange={(value) => handleSettingChange('currency', value.toUpperCase())}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="inr">INR (₹)</SelectItem>
                  <SelectItem value="pkr">PKR (₨)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('Currency')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>Manage your tax settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch id="tax-enabled" checked={settings.include_tax || false} onCheckedChange={(checked) => handleSettingChange('include_tax', checked)} />
                <Label htmlFor="tax-enabled">Enable GST/VAT</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave('Tax')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Export</CardTitle>
              <CardDescription>Export your shop data for backup purposes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Export All Products</h3>
                  <p className="text-sm text-muted-foreground">Download a CSV file of all your products.</p>
                </div>
                <Button variant="outline">Export</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-semibold">Export All Sales</h3>
                  <p className="text-sm text-muted-foreground">Download a CSV file of all your sales records.</p>
                </div>
                <Button variant="outline">Export</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

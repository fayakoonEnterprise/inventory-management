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
import { mockSettings } from '@/lib/data';
import Image from 'next/image';

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Settings"
        description="Configure your shop, manage currency, tax, and data."
      />

      <Tabs defaultValue="shop">
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
                <Image src={mockSettings.logoUrl} alt="Shop Logo" width={80} height={80} className="rounded-full" data-ai-hint="logo abstract" />
                <Button variant="outline">Change Logo</Button>
              </div>
              <div className="space-y-1">
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input id="shop-name" defaultValue={mockSettings.shopName} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue={mockSettings.address} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
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
              <Select defaultValue={mockSettings.currency.toLowerCase()}>
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
              <Button>Save Changes</Button>
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
                <Switch id="tax-enabled" defaultChecked={mockSettings.taxEnabled} />
                <Label htmlFor="tax-enabled">Enable GST/VAT</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
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
    </div>
  );
}

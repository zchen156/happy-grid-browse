import { useState } from "react";
import { Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
  const [ecoFriendly, setEcoFriendly] = useState(false);
  const [publicSharing, setPublicSharing] = useState(true);

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-muted-foreground">
              JD
              <button className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <Camera className="h-3 w-3 text-primary-foreground" />
              </button>
            </div>
            <div>
              <p className="font-medium text-foreground">John Doe</p>
              <p className="text-sm text-muted-foreground">@johndoe</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>First Name</Label>
              <Input defaultValue="John" />
            </div>
            <div className="space-y-1">
              <Label>Last Name</Label>
              <Input defaultValue="Doe" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Username</Label>
            <Input defaultValue="johndoe" />
          </div>
          <div className="space-y-1">
            <Label>Bio</Label>
            <Textarea defaultValue="Travel enthusiast exploring the world one city at a time." />
          </div>
        </CardContent>
      </Card>

      {/* Travel Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Travel Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Home Airport</Label>
              <Input defaultValue="SFO" />
            </div>
            <div className="space-y-1">
              <Label>Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="jpy">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Eco-Friendly Travel</p>
              <p className="text-xs text-muted-foreground">Prefer sustainable options</p>
            </div>
            <Switch checked={ecoFriendly} onCheckedChange={setEcoFriendly} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Public Sharing</p>
              <p className="text-xs text-muted-foreground">Allow others to see your library</p>
            </div>
            <Switch checked={publicSharing} onCheckedChange={setPublicSharing} />
          </div>
        </CardContent>
      </Card>

      {/* Connected Services */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Connected Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Google Maps", "Instagram", "TikTok"].map((service) => (
            <div key={service} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{service}</span>
              <Badge variant="secondary" className="text-xs">Not connected</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4">
        <Button variant="destructive" size="sm">Deactivate Account</Button>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Profile</Button>
      </div>
    </div>
  );
};

export default SettingsPage;

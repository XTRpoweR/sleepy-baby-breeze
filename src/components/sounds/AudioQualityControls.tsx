
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Monitor, 
  Signal, 
  SignalHigh,
  SignalLow,
  SignalMedium,
  Zap,
  Volume2,
  Battery,
  BatteryLow
} from 'lucide-react';

interface AudioQualityControlsProps {
  deviceCapabilities: {
    isMobile: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    supportsAdvancedAudio: boolean;
    networkSpeed: 'fast' | 'medium' | 'slow';
    batteryLevel?: number;
  };
  qualitySettings: {
    auto: boolean;
    preferred: 'high' | 'medium' | 'low';
  };
  currentQuality: 'high' | 'medium' | 'low';
  networkAdaptive: boolean;
  crossfadeEnabled: boolean;
  preloadEnabled: boolean;
  buffering: boolean;
  onQualitySettingsChange: (settings: { auto: boolean; preferred: 'high' | 'medium' | 'low' }) => void;
  onNetworkAdaptiveChange: (enabled: boolean) => void;
  onCrossfadeChange: (enabled: boolean) => void;
  onPreloadChange: (enabled: boolean) => void;
}

export const AudioQualityControls = ({
  deviceCapabilities,
  qualitySettings,
  currentQuality,
  networkAdaptive,
  crossfadeEnabled,
  preloadEnabled,
  buffering,
  onQualitySettingsChange,
  onNetworkAdaptiveChange,
  onCrossfadeChange,
  onPreloadChange
}: AudioQualityControlsProps) => {
  const getNetworkIcon = () => {
    switch (deviceCapabilities.networkSpeed) {
      case 'fast': return <SignalHigh className="h-4 w-4 text-green-600" />;
      case 'medium': return <SignalMedium className="h-4 w-4 text-yellow-600" />;
      case 'slow': return <SignalLow className="h-4 w-4 text-red-600" />;
      default: return <Signal className="h-4 w-4" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Settings className="h-5 w-5 text-blue-600" />
          <span>Audio Quality & Performance</span>
          {buffering && (
            <Badge variant="outline" className="ml-2 animate-pulse">
              Buffering...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quality" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quality" className="flex items-center space-x-1">
              <Volume2 className="h-3 w-3" />
              <span className="text-xs">Quality</span>
            </TabsTrigger>
            <TabsTrigger value="device" className="flex items-center space-x-1">
              {deviceCapabilities.isMobile ? (
                <Smartphone className="h-3 w-3" />
              ) : (
                <Monitor className="h-3 w-3" />
              )}
              <span className="text-xs">Device</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span className="text-xs">Advanced</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quality" className="space-y-4">
            {/* Current Status */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Quality</span>
                <Badge className={getQualityColor(currentQuality)}>
                  {currentQuality.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                {getNetworkIcon()}
                <span>Network: {deviceCapabilities.networkSpeed}</span>
                {deviceCapabilities.isMobile && (
                  <>
                    <Battery className="h-3 w-3" />
                    <span>Mobile optimized</span>
                  </>
                )}
              </div>
            </div>

            {/* Quality Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto Quality</Label>
                  <p className="text-xs text-gray-500">Automatically adjust based on connection</p>
                </div>
                <Switch
                  checked={qualitySettings.auto}
                  onCheckedChange={(auto) => 
                    onQualitySettingsChange({ ...qualitySettings, auto })
                  }
                />
              </div>

              {!qualitySettings.auto && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Preferred Quality</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['high', 'medium', 'low'] as const).map((quality) => (
                      <Button
                        key={quality}
                        variant={qualitySettings.preferred === quality ? "default" : "outline"}
                        size="sm"
                        onClick={() => 
                          onQualitySettingsChange({ ...qualitySettings, preferred: quality })
                        }
                      >
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Network Adaptive */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Network Adaptive</Label>
                <p className="text-xs text-gray-500">Adjust quality based on network conditions</p>
              </div>
              <Switch
                checked={networkAdaptive}
                onCheckedChange={onNetworkAdaptiveChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="device" className="space-y-4">
            {/* Device Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  {deviceCapabilities.isMobile ? (
                    <Smartphone className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Monitor className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-sm font-medium">Device Type</span>
                </div>
                <p className="text-xs text-gray-600">
                  {deviceCapabilities.isMobile ? (
                    deviceCapabilities.isIOS ? 'iOS Device' : 
                    deviceCapabilities.isAndroid ? 'Android Device' : 'Mobile Device'
                  ) : 'Desktop/Laptop'}
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  {getNetworkIcon()}
                  <span className="text-sm font-medium">Network</span>
                </div>
                <p className="text-xs text-gray-600">
                  {deviceCapabilities.networkSpeed.charAt(0).toUpperCase() + 
                   deviceCapabilities.networkSpeed.slice(1)} Speed
                </p>
              </div>
            </div>

            {/* Device Optimizations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Audio Preloading</Label>
                  <p className="text-xs text-gray-500">
                    {deviceCapabilities.isMobile ? 
                      'Reduces battery usage when disabled' : 
                      'Improves playback quality when enabled'
                    }
                  </p>
                </div>
                <Switch
                  checked={preloadEnabled}
                  onCheckedChange={onPreloadChange}
                />
              </div>

              {deviceCapabilities.isMobile && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <BatteryLow className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Mobile Optimization</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Audio quality automatically optimized for mobile performance and battery life.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {/* Advanced Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Crossfade Transitions</Label>
                  <p className="text-xs text-gray-500">Smooth transitions between tracks</p>
                </div>
                <Switch
                  checked={crossfadeEnabled}
                  onCheckedChange={onCrossfadeChange}
                />
              </div>

              {/* Audio Performance Metrics */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Performance</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Audio Context</span>
                    <Badge variant="outline" className="text-xs">
                      {deviceCapabilities.supportsAdvancedAudio ? 'Supported' : 'Limited'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Buffer Status</span>
                    <Badge variant="outline" className={buffering ? 'text-red-600' : 'text-green-600'}>
                      {buffering ? 'Buffering' : 'Ready'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

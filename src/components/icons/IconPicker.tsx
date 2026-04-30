import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Upload } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Popular icons for quick access - verified lucide-react icon names
const POPULAR_ICONS = [
  'Folder', 'Home', 'Star', 'Heart', 'Settings', 'User', 'Mail', 'Phone',
  'Calendar', 'Clock', 'Bell', 'Search', 'Camera', 'Image', 'Video', 'Music',
  'FileText', 'File', 'Archive', 'Database', 'Cloud', 'Download', 'Upload', 'Link',
  'Globe', 'Map', 'MapPin', 'Navigation', 'Compass', 'Sun', 'Moon', 'Zap',
  'Shield', 'Lock', 'Key', 'Eye', 'EyeOff', 'Bookmark', 'Tag', 'Flag',
  'Code', 'Terminal', 'Laptop', 'Monitor', 'Smartphone', 'Tablet', 'Cpu', 'Server',
  'Wifi', 'Bluetooth', 'Battery', 'Power', 'RefreshCw', 'RotateCw', 'Trash2', 'Edit',
  'Copy', 'Clipboard', 'CheckSquare', 'XSquare', 'PlusSquare', 'MinusSquare', 'LayoutGrid', 'List',
  'LayoutDashboard', 'PanelLeft', 'Menu', 'MoreHorizontal', 'MoreVertical', 'ChevronRight', 'ChevronDown', 'ArrowRight',
  'Sparkles', 'Wand2', 'Palette', 'Brush', 'PenTool', 'Pencil', 'Eraser', 'Type',
  'Bold', 'Italic', 'AlignLeft', 'AlignCenter', 'AlignRight', 'BarChart3', 'PieChart', 'TrendingUp',
  'DollarSign', 'CreditCard', 'Wallet', 'Gift', 'ShoppingCart', 'ShoppingBag', 'Package', 'Truck',
  'Users', 'UserPlus', 'UserMinus', 'MessageCircle', 'MessageSquare', 'Send', 'Share', 'Share2',
  'ThumbsUp', 'ThumbsDown', 'Award', 'Trophy', 'Target', 'Activity', 'HeartPulse', 'Stethoscope',
  'Pill', 'Syringe', 'Thermometer', 'Microscope', 'FlaskConical', 'Atom', 'Rocket', 'Plane',
  'Car', 'Bus', 'TrainFront', 'Ship', 'Bike', 'Building', 'Building2', 'Factory',
];

interface IconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
  onUploadIcon?: (file: File) => void;
  color?: string;
}

export function IconPicker({
  open,
  onOpenChange,
  selectedIcon,
  onSelectIcon,
  onUploadIcon,
  color = '#3b82f6',
}: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = useMemo(() => {
    if (!searchQuery) return POPULAR_ICONS;
    const query = searchQuery.toLowerCase();
    return POPULAR_ICONS.filter(icon => icon.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadIcon) {
      onUploadIcon(file);
      onOpenChange(false);
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Icon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Upload Button */}
          {onUploadIcon && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" asChild>
                <label>
                  <Upload className="w-4 h-4" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </Button>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Icons Grid */}
          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-8 gap-1">
              {filteredIcons.map((iconName) => (
                <button
                  key={iconName}
                  className={`p-2 rounded-md hover:bg-muted transition-colors flex items-center justify-center ${
                    selectedIcon === iconName ? 'bg-primary/20 ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    onSelectIcon(iconName);
                    onOpenChange(false);
                  }}
                  title={iconName}
                  style={{ color: selectedIcon === iconName ? color : undefined }}
                >
                  {renderIcon(iconName)}
                </button>
              ))}
            </div>
            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No icons found
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to render an icon by name
export function renderIconByName(iconName: string, className?: string, style?: React.CSSProperties) {
  const IconComponent = (LucideIcons as any)[iconName];
  if (!IconComponent) return <LucideIcons.Folder className={className} style={style} />;
  return <IconComponent className={className} style={style} />;
}

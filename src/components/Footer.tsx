'use client';

import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span>Made with</span>
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span>by Lautaro Fernandez</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

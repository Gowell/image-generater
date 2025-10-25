'use client';

import { useEffect, useState } from 'react';

interface ClientBodyProps {
  children: React.ReactNode;
}

export default function ClientBody({ children }: ClientBodyProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <body className="antialiased" suppressHydrationWarning={true}>
      {isHydrated && children}
    </body>
  );
}
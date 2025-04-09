'use client';

import PasswordChangeRequired from "@/components/PasswordChangeRequired";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PasswordChangeRequired>
      {children}
    </PasswordChangeRequired>
  );
}

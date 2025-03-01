import { SettingsNav } from '@/components/Settings/SettingsNav';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SettingsNav />
        </div>
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}
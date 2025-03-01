import { AccountSettings } from '@/components/Settings/AccountSettings';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
      <AccountSettings />
    </div>
  );
}
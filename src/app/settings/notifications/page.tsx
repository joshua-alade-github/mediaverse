import { NotificationSettings } from '@/components/Settings/NotificationSettings';

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Notification Settings
      </h1>
      <NotificationSettings />
    </div>
  );
}
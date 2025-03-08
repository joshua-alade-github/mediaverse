import { ClientProfilePage } from './client-page';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return <ClientProfilePage username={params.username} />;
}
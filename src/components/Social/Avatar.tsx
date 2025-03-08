import Image from 'next/image';

interface User {
  id: string;
  username: string;
  avatar?: string;
}

export const Avatar = ({ user }: { user: User }) => (
  <div className="h-10 w-10 rounded-full overflow-hidden">
    {user.avatar ? (
      <Image 
        src={user.avatar} 
        alt={user.username} 
        width={40} 
        height={40} 
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
        {user.username.charAt(0).toUpperCase()}
      </div>
    )}
  </div>
);
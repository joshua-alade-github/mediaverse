interface AvatarProps {
  user: {
    username: string;
    avatar_url?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ user, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.username}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-gray-500 font-medium">
          {user.username[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}
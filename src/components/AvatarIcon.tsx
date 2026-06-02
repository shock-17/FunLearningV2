import { ChildAvatar } from '../store/useAppStore';

const avatars = {
  fox: '🦊',
  bear: '🐻',
  rabbit: '🐰',
  owl: '🦉',
  turtle: '🐢',
};

export function AvatarIcon({
  avatar,
  size = 'md',
  className = '',
}: {
  avatar: ChildAvatar;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = {
    sm: 'text-2xl w-10 h-10',
    md: 'text-4xl w-16 h-16',
    lg: 'text-6xl w-24 h-24',
    xl: 'text-7xl w-32 h-32',
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-[#f4f3ff] to-[#e0ddf5] shadow-inner ${sizes[size]} ${className}`}
    >
      {avatars[avatar]}
    </div>
  );
}

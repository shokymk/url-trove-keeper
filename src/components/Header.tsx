
import { ModeToggle } from './ModeToggle';
import { Link } from 'react-router-dom';
import { BookmarkIcon } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b px-6 py-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <BookmarkIcon className="h-5 w-5 text-primary" />
          <h1 className="font-semibold tracking-tight text-lg">URL Trove</h1>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;

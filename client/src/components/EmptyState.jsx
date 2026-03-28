import { FileSearch } from 'lucide-react';

export default function EmptyState({ title = 'No data found', description = 'There is nothing to display here yet.', icon: Icon = FileSearch }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-primary-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm">{description}</p>
    </div>
  );
}

import { format, addDays, subDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { Button } from '../ui/button'

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-4">
      <Button
        onClick={() => onDateChange(subDays(selectedDate, 1))}
        variant="primary"
      >
        ← วันก่อน
      </Button>

      <div className="text-center">
        <div className="text-2xl font-semibold text-gray-900">
          {format(selectedDate, 'EEEE', { locale: th })}
        </div>
        <div className="text-lg text-gray-600">
          {format(selectedDate, 'dd MMMM yyyy', { locale: th })}
        </div>
      </div>

      <Button
        onClick={() => onDateChange(addDays(selectedDate, 1))}
        variant="primary"
      >
        วันถัดไป →
      </Button>
    </div>
  );
}

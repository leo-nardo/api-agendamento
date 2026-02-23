import { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, isBefore, differenceInMinutes, startOfDay, addMinutes, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export interface CalendarEvent {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELED' | 'BLOCKED' | 'COMPLETED';
    professionalName?: string;
    professionalId?: string;
    customerName?: string;
}

interface CalendarGridProps {
    events: CalendarEvent[];
    swimlanes?: { id: string, name: string }[];
    onEventClick?: (event: CalendarEvent) => void;
    onDateClick?: (date: Date, professionalId?: string) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 to 22:00
const HOUR_HEIGHT = 80; // pixels per hour

export default function CalendarGrid({ events, swimlanes, onEventClick, onDateClick }: CalendarGridProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
        return () => clearInterval(interval);
    }, []);

    const navigatePrevious = () => setCurrentDate(prev => addDays(prev, viewMode === 'week' ? -7 : -1));
    const navigateNext = () => setCurrentDate(prev => addDays(prev, viewMode === 'week' ? 7 : 1));
    const navigateToday = () => setCurrentDate(new Date());

    const daysToRender = useMemo(() => {
        if (viewMode === 'day') return [currentDate];
        const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [currentDate, viewMode]);

    const columnsToRender = useMemo(() => {
        if (viewMode === 'day' && swimlanes && swimlanes.length > 0) {
            return swimlanes.map(s => ({
                id: s.id,
                title: s.name,
                subtitle: format(currentDate, 'dd/MM', { locale: ptBR }),
                date: currentDate,
                isToday: isToday(currentDate),
                professionalId: s.id,
                events: events.filter(e => isSameDay(e.startTime, currentDate) && e.professionalId === s.id)
            }));
        } else {
            return daysToRender.map(day => ({
                id: day.toISOString(),
                title: format(day, 'EEE', { locale: ptBR }).toUpperCase(),
                subtitle: format(day, 'd'),
                date: day,
                isToday: isToday(day),
                professionalId: undefined,
                events: events.filter(e => isSameDay(e.startTime, day))
            }));
        }
    }, [viewMode, currentDate, daysToRender, swimlanes, events]);

    const getEventStyle = (event: CalendarEvent) => {
        const isPast = isBefore(event.endTime, currentTime);
        let baseClass = "absolute inset-x-1 rounded-md p-2 text-xs overflow-hidden cursor-pointer transition-shadow hover:shadow-md border ";

        if (event.status === 'BLOCKED') {
            baseClass += "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#f3f4f6_10px,#f3f4f6_20px)] border-gray-300 text-gray-500";
        } else if (event.status === 'CANCELED') {
            baseClass += "bg-red-50 border-red-200 text-red-700 line-through opacity-60";
        } else if (isPast) {
            baseClass += "bg-gray-100 border-gray-200 text-gray-500";
        } else {
            // Future active event
            baseClass += "bg-primary/10 border-primary/20 text-primary-foreground";
        }
        return baseClass;
    };

    const calculateEventPosition = (event: CalendarEvent) => {
        const startOfDayTime = startOfDay(event.startTime);
        const startOffsetMins = differenceInMinutes(event.startTime, startOfDayTime);
        const durationMins = differenceInMinutes(event.endTime, event.startTime);

        // Offset from 7:00 AM (420 minutes)
        const topMins = Math.max(0, startOffsetMins - 420);
        const top = (topMins / 60) * HOUR_HEIGHT;
        const height = (durationMins / 60) * HOUR_HEIGHT;

        return { top: `${top}px`, height: `${height}px` };
    };

    const calculateCurrentTimeLinePosition = () => {
        const startOfDayTime = startOfDay(currentTime);
        const currentMins = differenceInMinutes(currentTime, startOfDayTime);
        const topMins = currentMins - 420; // from 7am
        if (topMins < 0 || topMins > (16 * 60)) return null; // Outside grid
        return (topMins / 60) * HOUR_HEIGHT;
    };

    return (
        <div className="flex flex-col h-[800px] bg-white rounded-lg shadow border overflow-hidden">
            {/* Header Controls */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={navigateToday}>Hoje</Button>
                    <div className="flex items-center gap-1 ml-2">
                        <Button variant="ghost" size="icon" onClick={navigatePrevious}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={navigateNext}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                    <h2 className="text-lg font-semibold ml-2 capitalize">
                        {viewMode === 'day'
                            ? format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })
                            : `${format(daysToRender[0], "d MMM", { locale: ptBR })} - ${format(daysToRender[6], "d MMM", { locale: ptBR })}`
                        }
                    </h2>
                </div>
                <div className="flex items-center rounded-md border p-1 bg-white">
                    <Button
                        variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('day')}
                        className="text-xs"
                    >
                        Dia
                    </Button>
                    <Button
                        variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('week')}
                        className="text-xs hidden sm:flex"
                    >
                        Semana
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-1 overflow-auto">
                {/* Time Axis */}
                <div className="w-16 flex-shrink-0 border-r bg-white sticky left-0 z-20">
                    <div className="h-12 border-b"></div> {/* Header spacer */}
                    <div className="relative" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
                        {HOURS.map((hour, idx) => (
                            <div
                                key={hour}
                                className="absolute w-full flex items-start justify-center text-xs text-gray-500 font-medium"
                                style={{ top: `${idx * HOUR_HEIGHT}px`, transform: 'translateY(-50%)' }}
                            >
                                {hour}:00
                            </div>
                        ))}
                    </div>
                </div>

                {/* Columns */}
                <div className="flex flex-1 min-w-[300px]">
                    {columnsToRender.map((col) => (
                        <div key={col.id} className="flex-1 min-w-[200px] border-r border-gray-100 last:border-r-0 relative">
                            {/* Header */}
                            <div className={`h-12 border-b flex flex-col items-center justify-center sticky top-0 z-10 bg-white/95 backdrop-blur ${col.isToday && !col.professionalId ? 'text-primary' : 'text-gray-700'}`}>
                                <span className={`text-xs uppercase font-semibold ${col.professionalId ? 'truncate px-2 max-w-full' : ''}`}>{col.title}</span>
                                <span className={`text-lg font-bold flex items-center justify-center ${col.professionalId ? 'text-xs text-gray-500 font-normal' : 'h-7 w-7 rounded-full'} ${col.isToday && !col.professionalId ? 'bg-primary text-primary-foreground' : ''}`}>
                                    {col.subtitle}
                                </span>
                            </div>

                            {/* Time Slots */}
                            <div className="relative" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
                                {/* Horizontal grid lines */}
                                {HOURS.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="absolute w-full border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer"
                                        style={{ top: `${idx * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                                        onClick={() => {
                                            if (onDateClick) {
                                                const clickedTime = addMinutes(startOfDay(col.date), (idx + 7) * 60);
                                                onDateClick(clickedTime, col.professionalId);
                                            }
                                        }}
                                    ></div>
                                ))}

                                {/* Events */}
                                {col.events.map((event) => {
                                    const pos = calculateEventPosition(event);
                                    return (
                                        <div
                                            key={event.id}
                                            className={getEventStyle(event)}
                                            style={pos}
                                            onClick={() => onEventClick && onEventClick(event)}
                                        >
                                            <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">{event.title}</div>
                                            <div className="text-[10px] opacity-80">
                                                {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
                                            </div>
                                            {event.customerName && (
                                                <div className="text-[10px] truncate mt-1">{event.customerName}</div>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Current Time Indicator */}
                                {col.isToday && calculateCurrentTimeLinePosition() !== null && (
                                    <div
                                        className="absolute w-full z-10 pointer-events-none"
                                        style={{ top: `${calculateCurrentTimeLinePosition()}px` }}
                                    >
                                        <div className="absolute left-[-4px] top-[-4px] h-2 w-2 rounded-full bg-red-500"></div>
                                        <div className="h-[2px] w-full bg-red-500 relative bg-opacity-75"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

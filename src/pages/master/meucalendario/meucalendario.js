import React, { useState } from 'react';
import MonthlyCalendar from '../../../components/calendar-production/MonthlyCalendar';
import Calendar from '../../../components/calendar-production/Calendar';
import EventsToday from '../../../components/calendar-production/EventsFutures';
import EventsPasts from '../../../components/calendar-production/EventsPasts';
import Sidebar from '../../../components/SidebarGestock';
import { Icon } from '@iconify/react';
import "../../master/master.css";
import ScreenWarning from '../../../components/MaxPhone';

const CalendarProduction = () => {
    const [isCompactEventsToday, setIsCompactEventsToday] = useState(true);
    const [isCompactEventsPast, setIsCompactEventsPast] = useState(true);

    const toggleEventsToday = () => {
        setIsCompactEventsToday(!isCompactEventsToday);
        setIsCompactEventsPast(true); 
    };

    const toggleEventsPast = () => {
        setIsCompactEventsPast(!isCompactEventsPast);
        setIsCompactEventsToday(true);
    };

    return (
        <div className='dashboard'>
        <Sidebar className='sidebar-container' />
        <div className="container-calendar">
            <div className='contents-sidebar'>
                <Calendar />
                <EventsPasts
                    isCompact={isCompactEventsPast}
                    toggleCompact={toggleEventsPast}
                />
                <EventsToday
                    isCompact={isCompactEventsToday}
                    toggleCompact={toggleEventsToday}
                />
            </div>
            <MonthlyCalendar />
        </div>
        <ScreenWarning />
        </div>
    );
};

export default CalendarProduction;
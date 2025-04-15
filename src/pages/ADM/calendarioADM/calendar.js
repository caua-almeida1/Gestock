import React, { useState } from 'react';
import MonthlyCalendar from '../../../components/calendar-production/MonthlyCalendar';
import Calendar from '../../../components/calendar-production/Calendar';
import EventsToday from '../../../components/calendar-production/EventsFutures';
import EventsPasts from '../../../components/calendar-production/EventsPasts';
import Sidebaradm from '../components/sidebar';
import { Icon } from '@iconify/react';
import "../../master/master.css";
import ScreenWarning from '../../../components/MaxPhone';

const CalendarProductionADM = () => {
    const [isCompactEventsToday, setIsCompactEventsToday] = useState(true);
    const [isCompactEventsPast, setIsCompactEventsPast] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

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
        <Sidebaradm isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
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

export default CalendarProductionADM;
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import SelectedDaysBox from './SelectedDaysBox'; // Importe o novo componente

const MonthlyCalendar = () => {
    const [linedDays, setLinedDays] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [prodLogMonth, setProdLogMonth] = useState(new Date().getMonth());
    const [selectedDays, setSelectedDays] = useState([]);
    const [showSelectedDaysBox, setShowSelectedDaysBox] = useState(false);
    const [closing, setClosing] = useState(false); // Novo estado para controlar a animação de fechamento

    const year = new Date().getFullYear();
    const todayDate = new Date().getDate();
    const todayMonth = new Date().getMonth();

    const calendarRef = useRef(null);
    const [startPoint, setStartPoint] = useState(null);
    const [currentPoint, setCurrentPoint] = useState(null);

    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    useEffect(() => {
        const handleResize = () => {
            if (calendarRef.current) {
                const calendarWidth = calendarRef.current.offsetWidth;
                const newFontSize = calendarWidth < 600 ? '12px' : '16px';
                calendarRef.current.style.fontSize = newFontSize;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Chamar para ajustar ao carregar a página

        return () => window.removeEventListener('resize', handleResize);
    }, []);



    const generateSquareCalendar = () => {
        const firstDayOfMonth = new Date(year, prodLogMonth, 1).getDay();
        const lastDateOfMonth = new Date(year, prodLogMonth + 1, 0).getDate();
        const lastDayOfMonth = new Date(year, prodLogMonth, lastDateOfMonth).getDay();
        const lastDateOfLastMonth = new Date(year, prodLogMonth, 0).getDate();
        const days = [];
        for (let i = firstDayOfMonth; i > 0; i--) {
            days.push({ date: lastDateOfLastMonth - i + 1, className: 'inactive' });
        }
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const isToday = i === todayDate && prodLogMonth === todayMonth ? 'today' : '';
            days.push({ date: i, className: `${isToday}` });
        }
        for (let i = lastDayOfMonth; i < 6; i++) {
            days.push({ date: i - lastDayOfMonth + 1, className: 'inactive' });
        }

        return days;
    };

    const handleProdLogMonthChange = (direction) => {
        setProdLogMonth(prev => {
            let newMonth = direction === 'prev' ? prev - 1 : prev + 1;
            if (newMonth < 0 || newMonth > 11) {
                newMonth = newMonth < 0 ? 11 : 0;
            }
            return newMonth;
        });
    };

    const squareDays = generateSquareCalendar();

    const handleMouseDown = (e) => {
        const dayElement = e.target.closest('li');
    
        if (showSelectedDaysBox || !dayElement || !dayElement.closest('.days')) return;
    
        setIsDragging(true);
        const dayIndex = Array.from(calendarRef.current.querySelectorAll('.days li')).indexOf(dayElement);
        setStartPoint(dayIndex); // Armazenar o índice do dia inicial
    
        // Capturar as coordenadas iniciais para desenhar o quadrado azul
        const rect = calendarRef.current.getBoundingClientRect();
        setStartPoint({
            index: dayIndex,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setCurrentPoint({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };
    
    const handleMouseMove = (e) => {
        if (!isDragging || showSelectedDaysBox) return;
    
        const dayElement = e.target.closest('li');
        if (!dayElement || !dayElement.closest('.days')) return;
    
        const dayIndex = Array.from(calendarRef.current.querySelectorAll('.days li')).indexOf(dayElement);
        setCurrentPoint((prev) => ({
            ...prev,
            index: dayIndex,
            x: e.clientX - calendarRef.current.getBoundingClientRect().left,
            y: e.clientY - calendarRef.current.getBoundingClientRect().top
        }));
    };
    
    const handleMouseUp = () => {
        if (showSelectedDaysBox || startPoint === null || currentPoint === null) return;
    
        setIsDragging(false);
        const selected = getSelectedDays(); // Obtenha os dias entre o clique e o soltar do mouse
        setSelectedDays(selected);
        setShowSelectedDaysBox(true);
    };
    
    const getSelectedDays = () => {
        if (startPoint === null || currentPoint === null) return [];
    
        const daysElements = Array.from(calendarRef.current.querySelectorAll('.days li'));
        const minIndex = Math.min(startPoint.index, currentPoint.index);
        const maxIndex = Math.max(startPoint.index, currentPoint.index);
        const selected = [];
    
        for (let i = minIndex; i <= maxIndex; i++) {
            const dayElement = daysElements[i];
            const day = squareDays[i]?.date;
            if (day && !dayElement.className.includes('inactive')) {
                selected.push({ day, month: prodLogMonth, year });
            }
        }
    
        return selected;
    };
    

    const handleCloseBox = () => {
        setClosing(true); // Inicia a animação de fechamento
        setTimeout(() => {
            setShowSelectedDaysBox(false);
            setClosing(false); // Reseta o estado de fechamento
        }, 300); // O tempo da animação deve ser o mesmo da transição no CSS
    };

    return (
        <div className='calendars-months'>
        <div
            className={`calendar-prod-log ${showSelectedDaysBox ? 'days-blocked' : ''}`}
            ref={calendarRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ position: 'relative', userSelect: 'none' }}
        >
            <header className="calendar-header">
                <span onClick={() => handleProdLogMonthChange('prev')} className="calendar-icon">
                    <Icon icon="mdi:chevron-left" width="24" height="24" />
                </span>
                <p className="current-month">{months[prodLogMonth]}</p>
                <span onClick={() => handleProdLogMonthChange('next')} className="calendar-icon">
                    <Icon icon="mdi:chevron-right" width="24" height="24" />
                </span>
            </header>
            <div className="square-calendar">
                <ul className="weeks">
                    {daysOfWeek.map((day, index) => (
                        <li key={day} className={`week-day ${index === new Date().getDay() ? 'active-day' : ''}`}> {day} </li>
                    ))}
                </ul>
                <ul className="days">
                    {squareDays.map((day, index) => (
                        <li key={index} className={day.className}>
                            <span className={day.className.includes('today') ? 'today' : ''}>
                                <p>{day.date}</p>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {isDragging && (
                <div
                    className="selection-box"
                    style={{
                        position: 'absolute',
                        left: Math.min(startPoint?.x, currentPoint?.x),
                        top: Math.min(startPoint?.y, currentPoint?.y),
                        width: Math.abs(currentPoint?.x - startPoint?.x),
                        height: Math.abs(currentPoint?.y - startPoint?.y),
                        backgroundColor: 'rgba(0, 120, 215, 0.3)',
                        border: '1px solid rgba(0, 120, 215, 0.8)',
                        pointerEvents: 'none',
                    }}
                />
            )}

            {showSelectedDaysBox && (
                <SelectedDaysBox
                    selectedDays={selectedDays}
                    onClose={handleCloseBox}
                    closing={closing}
                    year={year}
                    prodLogMonth={prodLogMonth}
                />
            )}
        </div>
    </div>


    );
};

export default MonthlyCalendar;

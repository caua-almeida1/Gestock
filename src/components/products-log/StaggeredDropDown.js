import React, { useState } from "react";
import { motion } from "framer-motion"; 
import { Icon } from '@iconify/react';

const StaggeredDropDown = ({ onSelect }) => {
    const [open, setOpen] = useState(false);

    const handleOptionClick = (option) => {
        onSelect(option);  // Chama a função passada para notificar o componente pai sobre a seleção
        setOpen(false);    // Fecha o dropdown após selecionar
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(prev => !prev)}
                className="orders-button flex items-center gap-2 px-3 py-2 rounded-md text-indigo-50 bg-indigo-500 hover:bg-indigo-600 transition-colors"
            >
                <span className="font-medium text-sm">Ordenar por</span>
                <Icon icon="oui:arrow-down" />
            </button>

            {open && (
                <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="options-dropdown flex flex-col gap-2 p-2 rounded-lg bg-white shadow-xl"
                >
                    <Option text="A - Z" onClick={() => handleOptionClick("A - Z")} />
                    <Option text="Mais Recentes" onClick={() => handleOptionClick("Mais Recentes")} />
                    <Option text="Mais Antigos" onClick={() => handleOptionClick("Mais Antigos")} />
                </motion.ul>
            )}
        </div>
    );
};

const Option = ({ text, onClick }) => (
    <li 
        onClick={onClick}
        className="flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md hover:bg-indigo-100 text-slate-700 transition-colors cursor-pointer"
    >
        <span>{text}</span>
    </li>
);

export default StaggeredDropDown;


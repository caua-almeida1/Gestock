import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';

const StockDropdown = ({ productId, onEdit, onDuplicate, onShare, onRemove }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((pv) => !pv)}
                className="orders-button flex items-center gap-2 px-3 py-2 rounded-md text-indigo-50 bg-indigo-500 hover:bg-indigo-500 transition-colors"
            >
                <span className="font-medium text-sm">Estoque</span>
                <motion.span variants={iconVariants}>
                    <Icon icon="oui:controls-horizontal" />               </motion.span>
            </button>

            <motion.ul
                initial={wrapperVariants.closed}
                animate={open ? "open" : "closed"}
                variants={wrapperVariants}
                className="options-dropdown flex flex-col gap-2 p-2 rounded-lg bg-white shadow-xl absolute top-[120%] left-0 w-48 overflow-hidden"
            >
                <Option text="Livros" />
                <Option text="Eletrônicos" />
                <Option text="Materias Didáticos" />
            </motion.ul>
        </div>
    );
};

const Option = ({ text, icon, onClick }) => (
    <motion.li
        variants={itemVariants}
        onClick={onClick}
        className="flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md hover:bg-indigo-100 text-slate-700 hover:text-indigo-500 transition-colors cursor-pointer"
    >
        <motion.span variants={actionIconVariants}>
            <Icon icon={icon} />
        </motion.span>
        <span>{text}</span>
    </motion.li>
);

export default StockDropdown;

const wrapperVariants = {
    open: {
        scaleY: 1,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
    closed: {
        scaleY: 0,
        transition: {
            when: "afterChildren",
            staggerChildren: 0.1,
        },
    },
};

const iconVariants = {
    open: { rotate: 180 },
    closed: { rotate: 0 },
};

const itemVariants = {
    open: {
        opacity: 1,
        y: 0,
        transition: {
            when: "beforeChildren",
        },
    },
    closed: {
        opacity: 0,
        y: -15,
        transition: {
            when: "afterChildren",
        },
    },
};

const actionIconVariants = {
    open: { scale: 1, y: 0 },
    closed: { scale: 0, y: -7 },
};

import React from 'react';

const PopupOverlay = ({ isPopupClosing, isPopupEntering, handleClosePopup, children }) => {
    return (
        <div 
            className={`popup-overlay ${isPopupClosing ? 'popup-closing' : ''} ${isPopupEntering ? 'popup-entering' : ''}`}
            onClick={handleClosePopup}
        >
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export default PopupOverlay;

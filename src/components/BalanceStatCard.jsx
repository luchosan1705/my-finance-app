import React from 'react';

const BalanceStatCard = ({ title, arsValue, usdValue, icon }) => (
    <div className="stat-card">
        <div className="stat-card-icon-container">{icon}</div>
        <div>
            <p className="stat-card-title">{title}</p>
            <div className="balance-values">
                 <p className="balance-ars-value">
                    ARS {arsValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="balance-usd-value">
                    USD {usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>
    </div>
);

export default BalanceStatCard;
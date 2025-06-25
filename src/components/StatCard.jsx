const StatCard = ({ title, value, icon, currency = 'ARS', secondaryValue, secondaryCurrency }) => ( 
    <div className="stat-card"> 
        <div className="stat-card-icon-container">{icon}</div> 
        <div> 
            <p className="stat-card-title">{title}</p> 
            <p className="stat-card-value-primary"> 
                {currency} {value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
            </p> 
            {secondaryValue !== undefined && ( 
                <p className="stat-card-value-secondary"> 
                    ({secondaryCurrency} {secondaryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) 
                </p> 
            )} 
        </div> 
    </div> 
);

export default StatCard;
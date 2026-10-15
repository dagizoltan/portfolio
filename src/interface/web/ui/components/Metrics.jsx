export const Metrics = ({ metrics, label }) => {
    if (!metrics || metrics.length === 0) return null;

    return (
        <section className="metrics-section" aria-label={label || "Career figures"}>
            <div className="container">
                <div className="metrics-grid">
                    {metrics.map((metric, index) => (
                        <div key={index} className="metric-item">
                            <div className="metric-value">{metric.value}</div>
                            <div className="metric-label">{metric.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

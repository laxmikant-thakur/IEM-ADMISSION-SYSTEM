import { useEffect, useRef } from 'react';
import { Chart, ArcElement, DoughnutController, Tooltip } from 'chart.js';
import styles from './SeatChart.module.css';

Chart.register(ArcElement, DoughnutController, Tooltip);

/**
 * Single department donut chart
 */
function DeptDonut({ department }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const filled = department.filledSeats;
        const available = department.availableSeats;

        chartRef.current = new Chart(canvasRef.current, {
            type: 'doughnut',
            data: {
                labels: ['Filled', 'Available'],
                datasets: [{
                    data: [filled, available],
                    backgroundColor: ['#3b69b4', '#e4e7ec'],
                    borderWidth: 0,
                    cutout: '72%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: { enabled: true },
                    legend: { display: false }
                }
            }
        });

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [department]);

    return (
        <div className={styles.chartCard}>
            <div className={styles.deptName}>{department.name}</div>
            <div className={styles.chartContainer}>
                <canvas ref={canvasRef} />
                <div className={styles.chartCenter}>
                    <div className={styles.centerValue}>
                        {department.availableSeats}/{department.totalSeats}
                    </div>
                    <div className={styles.centerLabel}>seats</div>
                </div>
            </div>
        </div>
    );
}

/**
 * SeatSummary — Grid of all department donut charts
 * Reused on Dashboard, Applications, Review pages
 */
export function SeatSummary({ departments, showStats = false, totalSeats, availableSeats, filledSeats }) {
    return (
        <div>
            {showStats && (
                <div className={styles.summaryRow}>
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryValue}>{totalSeats}</div>
                        <div className={styles.summaryLabel}>Total Seats</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={`${styles.summaryValue} ${styles.available}`}>{availableSeats}</div>
                        <div className={styles.summaryLabel}>Available</div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={`${styles.summaryValue} ${styles.filled}`}>{filledSeats}</div>
                        <div className={styles.summaryLabel}>Filled</div>
                    </div>
                </div>
            )}
            <div className={styles.chartGrid}>
                {departments.map(dept => (
                    <DeptDonut key={dept.id} department={dept} />
                ))}
            </div>
        </div>
    );
}

export default DeptDonut;

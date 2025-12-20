// Utilities: report generation and related helpers
export async function generateCoachReport() {
  try {
    const bookingsAll = await (window.storage ? window.storage.getAll() : Promise.resolve([]));
    const bookings = bookingsAll.filter(b => b.status !== 'cancelled');

    const byCoach = {};
    bookings.forEach(booking => {
      if (!byCoach[booking.coach]) byCoach[booking.coach] = [];
      byCoach[booking.coach].push(booking);
    });

    let report = 'AM TENNIS ACADEMY - COACH HOURS REPORT\n';
    report += '='.repeat(60) + '\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;

    Object.keys(byCoach).sort().forEach(coach => {
      const lessons = byCoach[coach].sort((a, b) => new Date(a.date) - new Date(b.date));
      const totalHours = lessons.reduce((sum, l) => sum + (parseInt(l.duration) / 60), 0);
      const totalRevenue = lessons.reduce((sum, l) => sum + parseFloat(l.price), 0);

      report += `\n${'='.repeat(60)}\n`;
      report += `COACH: ${coach}\n`;
      report += `Total Lessons: ${lessons.length}\n`;
      report += `Total Hours: ${totalHours.toFixed(2)}\n`;
      report += `Total Revenue: $${totalRevenue.toFixed(2)}\n`;
      report += `${'='.repeat(60)}\n\n`;

      lessons.forEach(lesson => {
        report += `Date: ${lesson.date} at ${lesson.time}\n`;
        report += `  Client: ${lesson.name}\n`;
        report += `  Duration: ${lesson.duration} minutes (${(parseInt(lesson.duration) / 60).toFixed(2)} hours)\n`;
        report += `  Price: $${lesson.price}\n`;
        report += `  Status: ${lesson.status}\n`;
        if (lesson.notes) report += `  Notes: ${lesson.notes}\n`;
        report += `\n`;
      });
    });

    const allBookings = bookings;
    const grandTotalHours = allBookings.reduce((sum, l) => sum + (parseInt(l.duration) / 60), 0);
    const grandTotalRevenue = allBookings.reduce((sum, l) => sum + parseFloat(l.price), 0);

    report += `\n${'='.repeat(60)}\n`;
    report += `GRAND TOTALS\n`;
    report += `${'='.repeat(60)}\n`;
    report += `Total Lessons: ${allBookings.length}\n`;
    report += `Total Hours: ${grandTotalHours.toFixed(2)}\n`;
    report += `Total Revenue: $${grandTotalRevenue.toFixed(2)}\n`;

    return report;
  } catch (err) {
    console.error('generateCoachReport error:', err);
    return 'Error generating report';
  }
}

export async function downloadReport() {
  const report = await generateCoachReport();
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tennis-coach-report-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Attach to window for existing inline code compatibility
if (typeof window !== 'undefined') {
  window.generateCoachReport = generateCoachReport;
  window.downloadReport = downloadReport;
}

export default { generateCoachReport, downloadReport };

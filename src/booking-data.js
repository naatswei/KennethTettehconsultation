export class BookingService {
    constructor() {
        this.storageKey = 'kt_consultation_bookings';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            // Initial mock data: February 20, 2026, 14:00 is booked
            const initialBookings = [
                { date: '2026-02-20', time: '14:00' },
                { date: '2026-02-20', time: '15:00' },
                { date: '2026-02-25', time: '10:00' }
            ];
            localStorage.setItem(this.storageKey, JSON.stringify(initialBookings));
        }
    }

    getBookings() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    isBooked(dateStr, timeStr) {
        const bookings = this.getBookings();
        return bookings.some(b => b.date === dateStr && b.time === timeStr);
    }

    addBooking(dateStr, timeStr) {
        const bookings = this.getBookings();
        if (!this.isBooked(dateStr, timeStr)) {
            bookings.push({ date: dateStr, time: timeStr });
            localStorage.setItem(this.storageKey, JSON.stringify(bookings));
            return true;
        }
        return false;
    }

    // Helper to format Date object to YYYY-MM-DD
    formatDate(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }
}

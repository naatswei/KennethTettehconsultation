import { BookingService } from './booking-data.js';

export class Calendar {
    constructor() {
        this.bookingService = new BookingService();
        this.date = new Date();
        this.selectedDate = null;
        this.currentMonth = this.date.getMonth();
        this.currentYear = this.date.getFullYear();

        this.monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
    }

    cacheDOM() {
        this.currentMonthEl = document.querySelector('.current-month');
        this.datesEl = document.querySelector('.dates');
        this.prevBtn = document.querySelector('.calendar-nav-btn[aria-label="Previous month"]');
        this.nextBtn = document.querySelector('.calendar-nav-btn[aria-label="Next month"]');
        this.timeSlots = document.querySelectorAll('.time-slot');
        this.slotsHeader = document.querySelector('.slots-header h3');
        this.enterBtn = document.getElementById('calendarEnterBtn');
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prevMonth());
        this.nextBtn.addEventListener('click', () => this.nextMonth());

        // Event delegation for dates
        this.datesEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('date') && !e.target.classList.contains('empty') && !e.target.classList.contains('disabled')) {
                this.selectDate(e.target);
            }
        });

        // Time slots
        this.timeSlots.forEach(slot => {
            slot.addEventListener('click', (e) => this.selectTimeSlot(e.target));
        });

        // Enter button
        if (this.enterBtn) {
            this.enterBtn.addEventListener('click', () => this.handleEnter());
        }
    }

    render() {
        this.currentMonthEl.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        this.datesEl.innerHTML = '';

        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        // Adjust for Monday start (0 = Sunday, 1 = Monday ...)
        // If Sunday (0), it becomes 6. Monday (1) becomes 0.
        const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;

        // Empty spans for previous month
        for (let i = 0; i < startDayIndex; i++) {
            const span = document.createElement('span');
            span.classList.add('empty');
            this.datesEl.appendChild(span);
        }

        // Days
        const today = new Date();
        const availableSlotsCount = this.timeSlots.length;

        for (let i = 1; i <= daysInMonth; i++) {
            const span = document.createElement('span');
            span.classList.add('date');
            span.textContent = i;
            span.dataset.date = i;

            const dateToCheck = new Date(this.currentYear, this.currentMonth, i);
            const dateStr = this.bookingService.formatDate(dateToCheck);

            dateToCheck.setHours(0, 0, 0, 0);
            const todayReset = new Date();
            todayReset.setHours(0, 0, 0, 0);

            if (dateToCheck < todayReset) {
                span.classList.add('disabled');
            }

            // Check if all slots are booked for this day
            const dayBookings = this.bookingService.getBookings().filter(b => b.date === dateStr);
            if (dayBookings.length >= availableSlotsCount) {
                span.classList.add('full');
            }

            // Check if selected
            if (this.selectedDate &&
                this.selectedDate.getDate() === i &&
                this.selectedDate.getMonth() === this.currentMonth &&
                this.selectedDate.getFullYear() === this.currentYear) {
                span.classList.add('selected');
            }

            this.datesEl.appendChild(span);
        }
    }

    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.render();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.render();
    }

    selectDate(el) {
        if (el.classList.contains('full')) {
            alert('Sorry, this date is fully booked. Please select another date.');
            return;
        }

        // Remove previous selection
        const prevSelected = this.datesEl.querySelector('.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        el.classList.add('selected');

        const day = parseInt(el.dataset.date);
        this.selectedDate = new Date(this.currentYear, this.currentMonth, day);

        this.updateHeader(this.selectedDate);
        this.updateTimeSlotsAvailability();
    }

    updateTimeSlotsAvailability() {
        if (!this.selectedDate) return;

        const dateStr = this.bookingService.formatDate(this.selectedDate);

        this.timeSlots.forEach(slot => {
            const timeStr = slot.textContent.trim();
            slot.classList.remove('selected');

            if (this.bookingService.isBooked(dateStr, timeStr)) {
                slot.classList.add('booked');
                slot.disabled = true;
            } else {
                slot.classList.remove('booked');
                slot.disabled = false;
            }
        });
    }

    selectTimeSlot(el) {
        if (el.classList.contains('booked')) return;

        // Remove selection from all slots
        this.timeSlots.forEach(slot => {
            slot.classList.remove('selected');
        });

        // Add selection to clicked slot
        el.classList.add('selected');
    }

    updateHeader(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.slotsHeader.textContent = date.toLocaleDateString('en-US', options);
    }

    handleEnter() {
        const selectedDate = this.selectedDate;
        const selectedSlot = document.querySelector('.time-slot.selected');

        if (!selectedDate) {
            alert('Please select a date.');
            return;
        }

        if (!selectedSlot) {
            alert('Please select a time slot.');
            return;
        }

        const dateStr = this.bookingService.formatDate(selectedDate);
        const timeStr = selectedSlot.textContent.trim();

        // Simulate booking confirmation
        if (this.bookingService.addBooking(dateStr, timeStr)) {
            // Success - Proceed to booking section
            const bookingSection = document.getElementById('booking');
            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: 'smooth' });
                console.log('Booked successfully:', dateStr, timeStr);
            }
        } else {
            alert('Sorry, this slot was just taken. Please select another.');
            this.updateTimeSlotsAvailability();
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});
